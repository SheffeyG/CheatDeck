import {
  type ParseDiagnostic,
  type ParsedLaunchOptions,
  type ParsedPrefix,
  parseLaunchOptions,
  parseLiteralWords,
  type SourceSpan,
} from "./parser";

export type LaunchOptionDefinition =
  | { kind: "environment"; name: string; value: string }
  | { kind: "prefix"; argv: readonly [string, ...string[]] }
  | { kind: "argument"; arity: 0; token: string }
  | { kind: "argument"; arity: 1; token: string; argument: string }
  | { kind: "trusted-prefix"; source: string };

export type CustomLaunchOptionDefinition = Exclude<LaunchOptionDefinition, { kind: "trusted-prefix" }>;

export interface DefinitionIssue {
  field: "name" | "argv" | "token" | "argument";
  code: string;
}

export type LaunchOptionsEditResult =
  | { ok: true; value: LaunchOptions; changed: boolean }
  | { ok: false; value: LaunchOptions; error: "document-not-editable" | "invalid-definition" | "invalid-result" };

interface Match {
  span: SourceSpan;
  prefix?: ParsedPrefix;
}

interface TextEdit {
  span: SourceSpan;
  replacement: string;
}

type InternalEdit =
  | { kind: "enable"; definition: LaunchOptionDefinition }
  | { kind: "disable"; definition: LaunchOptionDefinition }
  | { kind: "remove-environment"; name: string };

const safeWord = /^[A-Za-z0-9_.,:@%+/-]+$/;
const environmentName = /^[A-Za-z_][A-Za-z0-9_]*$/;
const reservedWords = new Set(["%command%", "--"]);

const renderLiteralWord = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;
const renderWord = (value: string): string =>
  safeWord.test(value) && !reservedWords.has(value) ? value : renderLiteralWord(value);

export const validateLaunchOption = (definition: LaunchOptionDefinition): readonly DefinitionIssue[] => {
  const issues: DefinitionIssue[] = [];
  if (definition.kind === "environment" && !environmentName.test(definition.name)) {
    issues.push({ field: "name", code: "invalid-environment-name" });
  }
  if (definition.kind === "prefix" && (definition.argv.length === 0 || definition.argv.some((value) => !value))) {
    issues.push({ field: "argv", code: "empty-prefix-word" });
  }
  if (
    definition.kind === "argument" &&
    (!definition.token.startsWith("-") ||
      definition.token === "-" ||
      definition.token === "--" ||
      !safeWord.test(definition.token))
  ) {
    issues.push({ field: "token", code: "invalid-argument-token" });
  }
  if (definition.kind === "argument" && definition.arity === 1 && definition.argument.length === 0) {
    issues.push({ field: "argument", code: "empty-argument" });
  }
  if (definition.kind === "trusted-prefix" && definition.source.trim() !== definition.source) {
    issues.push({ field: "argv", code: "invalid-trusted-prefix" });
  }
  return issues;
};

const renderDefinition = (definition: LaunchOptionDefinition): string => {
  switch (definition.kind) {
    case "environment":
      return `${definition.name}=${renderWord(definition.value)}`;
    case "prefix":
      return definition.argv.map(renderWord).join(" ");
    case "argument":
      return definition.arity === 0 ? definition.token : `${definition.token} ${renderWord(definition.argument)}`;
    case "trusted-prefix":
      return definition.source;
  }
};

export const parseLiteralArgv = parseLiteralWords;
export const renderLiteralArgv = (argv: readonly [string, ...string[]]): string => argv.map(renderWord).join(" ");

const prefixMatches = (prefix: ParsedPrefix, definition: LaunchOptionDefinition): boolean => {
  if (definition.kind === "trusted-prefix") return prefix.words.map((word) => word.raw).join(" ") === definition.source;
  if (definition.kind !== "prefix" || prefix.words.length !== definition.argv.length) return false;
  return prefix.words.every((word, index) => word.literal === definition.argv[index]);
};

const findMatches = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): Match[] => {
  if (definition.kind === "environment") {
    return parsed.assignments
      .filter((assignment) => assignment.name === definition.name && assignment.value === definition.value)
      .map((assignment) => ({ span: assignment.span }));
  }
  if (definition.kind === "prefix" || definition.kind === "trusted-prefix") {
    return parsed.prefixes
      .filter((prefix) => prefixMatches(prefix, definition))
      .map((prefix) => ({ span: prefix.span, prefix }));
  }
  const matches: Match[] = [];
  for (let index = 0; index < parsed.arguments.length; index++) {
    const word = parsed.arguments[index];
    if (word.literal !== definition.token) continue;
    if (definition.arity === 0) matches.push({ span: word.span });
    else {
      const argument = parsed.arguments[index + 1];
      if (argument?.literal === definition.argument) {
        matches.push({ span: { start: word.span.start, end: argument.span.end } });
        index++;
      }
    }
  }
  return matches;
};

const isEnabled = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): boolean => {
  if (definition.kind !== "environment") return findMatches(parsed, definition).length > 0;
  const effective = parsed.assignments.filter((assignment) => assignment.name === definition.name).slice(-1)[0];
  return effective?.value === definition.value;
};

const leadingOwnedSpan = (source: string, target: SourceSpan): SourceSpan => {
  let start = target.start;
  while (start > 0 && /[\t ]/.test(source[start - 1])) start--;
  return { start, end: target.end };
};

const prefixDeletionSpan = (parsed: ParsedLaunchOptions, index: number): SourceSpan => {
  const prefix = parsed.prefixes[index];
  if (prefix.separatorBefore) {
    return leadingOwnedSpan(parsed.source, { start: prefix.separatorBefore.start, end: prefix.span.end });
  }
  const next = parsed.prefixes[index + 1];
  if (next?.separatorBefore) return { start: prefix.span.start, end: next.separatorBefore.end };
  if (prefix.separatorAfter)
    return leadingOwnedSpan(parsed.source, { start: prefix.span.start, end: prefix.separatorAfter.end });
  return leadingOwnedSpan(parsed.source, prefix.span);
};

const mergeDeletions = (edits: readonly TextEdit[]): TextEdit[] => {
  const sorted = [...edits].sort((left, right) => left.span.start - right.span.start || left.span.end - right.span.end);
  const merged: TextEdit[] = [];
  for (const edit of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && previous.replacement === "" && edit.replacement === "" && edit.span.start <= previous.span.end) {
      previous.span.end = Math.max(previous.span.end, edit.span.end);
    } else merged.push({ span: { ...edit.span }, replacement: edit.replacement });
  }
  return merged;
};

const applyTextEdits = (source: string, edits: readonly TextEdit[]): string =>
  mergeDeletions(edits)
    .sort((left, right) => right.span.start - left.span.start || right.span.end - left.span.end)
    .reduce(
      (current, edit) => current.slice(0, edit.span.start) + edit.replacement + current.slice(edit.span.end),
      source,
    );

const argumentSlotEdits = (
  parsed: ParsedLaunchOptions,
  definition: Extract<LaunchOptionDefinition, { kind: "argument" }>,
): TextEdit[] => {
  const edits: TextEdit[] = [];
  for (let index = 0; index < parsed.arguments.length; index++) {
    const word = parsed.arguments[index];
    if (word.literal !== definition.token) continue;
    const next = parsed.arguments[index + 1];
    const end =
      definition.arity === 1 && next?.literal !== undefined && !next.literal.startsWith("-")
        ? next.span.end
        : word.span.end;
    edits.push({ span: leadingOwnedSpan(parsed.source, { start: word.span.start, end }), replacement: "" });
    if (end !== word.span.end) index++;
  }
  return edits;
};

const exactDeletionEdits = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit[] =>
  findMatches(parsed, definition).map((match) => ({
    span: match.prefix
      ? prefixDeletionSpan(parsed, parsed.prefixes.indexOf(match.prefix))
      : leadingOwnedSpan(parsed.source, match.span),
    replacement: "",
  }));

const slotDeletionEdits = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit[] => {
  if (definition.kind === "environment") {
    return parsed.assignments
      .filter((assignment) => assignment.name === definition.name)
      .map((assignment) => ({ span: leadingOwnedSpan(parsed.source, assignment.span), replacement: "" }));
  }
  if (definition.kind === "argument") return argumentSlotEdits(parsed, definition);
  return exactDeletionEdits(parsed, definition);
};

const insertionEdit = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit => {
  const rendered = renderDefinition(definition);
  if (parsed.implicitMarker) {
    const replacement = definition.kind === "argument" ? `%command% ${rendered}` : `${rendered} %command%`;
    return { span: { start: 0, end: parsed.source.length }, replacement };
  }
  if (!parsed.marker) throw new Error("editable launch options must have a marker");
  if (definition.kind === "environment") {
    const position = parsed.prefixes[0]?.span.start ?? parsed.marker.span.start;
    return { span: { start: position, end: position }, replacement: `${rendered} ` };
  }
  if (definition.kind === "prefix" || definition.kind === "trusted-prefix") {
    if (parsed.prefixes.length > 0) {
      const position = parsed.prefixes[0].span.start;
      return { span: { start: position, end: position }, replacement: `${rendered} -- ` };
    }
    return {
      span: { start: parsed.marker.span.start, end: parsed.marker.span.start },
      replacement: `${rendered} `,
    };
  }
  const position = parsed.arguments[parsed.arguments.length - 1]?.span.end ?? parsed.marker.span.end;
  return { span: { start: position, end: position }, replacement: ` ${rendered}` };
};

const definitions = {
  dxvkAsync: { kind: "environment", name: "DXVK_ASYNC", value: "1" },
  radvPerftest: { kind: "environment", name: "RADV_PERFTEST", value: "gpl" },
  losslessScaling: { kind: "trusted-prefix", source: "~/lsfg" },
  framegenPatch: { kind: "trusted-prefix", source: "~/fgmod/fgmod" },
  framegenUnpatch: { kind: "trusted-prefix", source: "~/fgmod/fgmod-uninstaller.sh" },
} as const satisfies Record<string, LaunchOptionDefinition>;

const keys = {
  trainer: "PROTON_REMOTE_DEBUG_CMD",
  trainerDirectory: "PRESSURE_VESSEL_FILESYSTEMS_RW",
  language: "LANG",
  hostLanguage: "HOST_LC_ALL",
  compatibilityPath: "STEAM_COMPAT_DATA_PATH",
} as const;

const environment = (name: string, value: string): LaunchOptionDefinition => ({ kind: "environment", name, value });
const parentPath = (path: string): string => {
  const separator = path.lastIndexOf("/");
  if (separator < 0) return ".";
  return separator === 0 ? path[0] : path.slice(0, separator);
};
const quoteShellArgument = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;
const unwrapShellArgument = (value: string | undefined): string | undefined => {
  if (value?.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).split(`'"'"'`).join("'");
  return value;
};

export class LaunchOptions {
  readonly parsed: ParsedLaunchOptions;

  private constructor(readonly source: string) {
    this.parsed = parseLaunchOptions(source);
  }

  static parse(source: string): LaunchOptions {
    return new LaunchOptions(source);
  }

  get editable(): boolean {
    return this.parsed.diagnostics.length === 0;
  }

  get diagnostics(): readonly ParseDiagnostic[] {
    return this.parsed.diagnostics;
  }

  toString(): string {
    return this.source;
  }

  isEnabled(definition: LaunchOptionDefinition): boolean {
    return this.editable && isEnabled(this.parsed, definition);
  }

  setEnabled(definition: LaunchOptionDefinition, enabled: boolean): LaunchOptionsEditResult {
    return this.apply([{ kind: enabled ? "enable" : "disable", definition }]);
  }

  replaceDefinition(previous: LaunchOptionDefinition, next: LaunchOptionDefinition): LaunchOptionsEditResult {
    if (!this.isEnabled(previous)) return { ok: true, value: this, changed: false };
    return this.apply([
      { kind: "disable", definition: previous },
      { kind: "enable", definition: next },
    ]);
  }

  private environmentValue(name: string): string | undefined {
    return this.parsed.assignments.filter((assignment) => assignment.name === name).slice(-1)[0]?.value;
  }

  private hasEnvironment(name: string): boolean {
    return this.parsed.assignments.some((assignment) => assignment.name === name);
  }

  get trainerPath(): string | undefined {
    return unwrapShellArgument(this.environmentValue(keys.trainer));
  }

  get trainerDirectory(): string | undefined {
    return this.environmentValue(keys.trainerDirectory);
  }

  get language(): string | undefined {
    return this.environmentValue(keys.language);
  }

  get compatibilityPath(): string | undefined {
    return this.environmentValue(keys.compatibilityPath);
  }

  get isTrainerEnabled(): boolean {
    return this.hasEnvironment(keys.trainer);
  }

  get isLanguageEnabled(): boolean {
    return this.hasEnvironment(keys.language) || this.hasEnvironment(keys.hostLanguage);
  }

  get isDxvkAsyncEnabled(): boolean {
    return this.isEnabled(definitions.dxvkAsync);
  }

  get isRadvPerftestEnabled(): boolean {
    return this.isEnabled(definitions.radvPerftest);
  }

  get isLosslessScalingEnabled(): boolean {
    return this.isEnabled(definitions.losslessScaling);
  }

  get isFramegenPatchEnabled(): boolean {
    return this.isEnabled(definitions.framegenPatch);
  }

  get isFramegenUnpatchEnabled(): boolean {
    return this.isEnabled(definitions.framegenUnpatch);
  }

  setTrainer(path: string): LaunchOptionsEditResult {
    return this.apply([
      { kind: "enable", definition: environment(keys.trainer, quoteShellArgument(path)) },
      { kind: "enable", definition: environment(keys.trainerDirectory, parentPath(path)) },
    ]);
  }

  disableTrainer(): LaunchOptionsEditResult {
    return this.apply([
      { kind: "remove-environment", name: keys.trainer },
      { kind: "remove-environment", name: keys.trainerDirectory },
    ]);
  }

  setLanguage(value: string): LaunchOptionsEditResult {
    return this.apply([
      { kind: "enable", definition: environment(keys.language, value) },
      { kind: "enable", definition: environment(keys.hostLanguage, value) },
    ]);
  }

  disableLanguage(): LaunchOptionsEditResult {
    return this.apply([
      { kind: "remove-environment", name: keys.language },
      { kind: "remove-environment", name: keys.hostLanguage },
    ]);
  }

  setCompatibilityPath(value: string): LaunchOptionsEditResult {
    return this.apply([{ kind: "enable", definition: environment(keys.compatibilityPath, value) }]);
  }

  disableCompatibilityPath(): LaunchOptionsEditResult {
    return this.apply([{ kind: "remove-environment", name: keys.compatibilityPath }]);
  }

  setDxvkAsync(enabled: boolean): LaunchOptionsEditResult {
    return this.setEnabled(definitions.dxvkAsync, enabled);
  }

  setRadvPerftest(enabled: boolean): LaunchOptionsEditResult {
    return this.setEnabled(definitions.radvPerftest, enabled);
  }

  setLosslessScaling(enabled: boolean): LaunchOptionsEditResult {
    return this.setEnabled(definitions.losslessScaling, enabled);
  }

  setFramegenPatch(enabled: boolean): LaunchOptionsEditResult {
    return this.apply(
      enabled
        ? [
            { kind: "disable", definition: definitions.framegenUnpatch },
            { kind: "enable", definition: definitions.framegenPatch },
          ]
        : [{ kind: "disable", definition: definitions.framegenPatch }],
    );
  }

  setFramegenUnpatch(enabled: boolean): LaunchOptionsEditResult {
    return this.apply(
      enabled
        ? [
            { kind: "disable", definition: definitions.framegenPatch },
            { kind: "enable", definition: definitions.framegenUnpatch },
          ]
        : [{ kind: "disable", definition: definitions.framegenUnpatch }],
    );
  }

  private apply(edits: readonly InternalEdit[]): LaunchOptionsEditResult {
    if (!this.editable) return { ok: false, value: this, error: "document-not-editable" };
    let current: LaunchOptions = this;
    let changed = false;
    for (const edit of edits) {
      const result = current.applyOne(edit);
      if (!result.ok) return { ...result, value: this };
      current = result.value;
      changed ||= result.changed;
    }
    return { ok: true, value: current, changed };
  }

  private applyOne(edit: InternalEdit): LaunchOptionsEditResult {
    if (edit.kind === "remove-environment") {
      const deletions = this.parsed.assignments
        .filter((assignment) => assignment.name === edit.name)
        .map((assignment) => ({ span: leadingOwnedSpan(this.source, assignment.span), replacement: "" }));
      return deletions.length === 0
        ? { ok: true, value: this, changed: false }
        : this.finish(applyTextEdits(this.source, deletions));
    }
    if (validateLaunchOption(edit.definition).length > 0) {
      return { ok: false, value: this, error: "invalid-definition" };
    }
    const matches = findMatches(this.parsed, edit.definition);
    if (edit.kind === "disable") {
      if (matches.length === 0) return { ok: true, value: this, changed: false };
      return this.finish(applyTextEdits(this.source, exactDeletionEdits(this.parsed, edit.definition)));
    }
    if (this.isCanonical(edit.definition, matches.length)) return { ok: true, value: this, changed: false };
    const withoutSlot = applyTextEdits(this.source, slotDeletionEdits(this.parsed, edit.definition));
    const intermediate = LaunchOptions.parse(withoutSlot);
    if (!intermediate.editable) return { ok: false, value: this, error: "invalid-result" };
    return this.finish(applyTextEdits(withoutSlot, [insertionEdit(intermediate.parsed, edit.definition)]));
  }

  private isCanonical(definition: LaunchOptionDefinition, matchCount: number): boolean {
    if (matchCount !== 1) return false;
    if (definition.kind === "environment") {
      return this.parsed.assignments.filter((assignment) => assignment.name === definition.name).length === 1;
    }
    if (definition.kind === "argument") {
      return this.parsed.arguments.filter((word) => word.literal === definition.token).length === 1;
    }
    return true;
  }

  private finish(source: string): LaunchOptionsEditResult {
    const normalized = source.trim() === "%command%" ? "" : source;
    const value = LaunchOptions.parse(normalized);
    if (!value.editable) return { ok: false, value: this, error: "invalid-result" };
    return { ok: true, value, changed: normalized !== this.source };
  }
}
