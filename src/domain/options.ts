import {
  type ParseDiagnostic,
  type ParsedLaunchOptions,
  type ParsedPrefix,
  parseLaunchOptions,
  parseRawWords,
  type SourceSpan,
} from "./parser";

export type LaunchOptionDefinition =
  | { kind: "environment"; name: string; value: string }
  | { kind: "prefix"; command: string; argv: readonly string[] }
  | { kind: "argument"; flag: string; argv: readonly string[] };

export type LaunchOptionsEditResult =
  | { ok: true; value: LaunchOptions; changed: boolean }
  | { ok: false; value: LaunchOptions; error: "document-not-editable" | "invalid-definition" | "invalid-result" };

interface TextEdit {
  span: SourceSpan;
  replacement: string;
}

type LaunchOptionsEdit =
  | { kind: "enable"; definition: LaunchOptionDefinition }
  | { kind: "disable"; definition: LaunchOptionDefinition };

const unquotedWord = /^[A-Za-z0-9_.,:@%+/-]+$/;
const environmentName = /^[A-Za-z_][A-Za-z0-9_]*$/;
const reservedWords = new Set(["%command%", "--"]);

const quoteWord = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;
const renderWord = (value: string): string =>
  unquotedWord.test(value) && !reservedWords.has(value) ? value : quoteWord(value);

const areValidRawWords = (words: readonly string[]): boolean => {
  if (words.length === 0) return true;
  const parsed = parseRawWords(words.join(" "));
  return parsed !== undefined && parsed.length === words.length && parsed.every((word, index) => word === words[index]);
};

const isValidFlag = (flag: string): boolean =>
  flag.startsWith("-") && flag !== "-" && flag !== "--" && unquotedWord.test(flag);

export const isValidLaunchOption = (definition: LaunchOptionDefinition): boolean => {
  switch (definition.kind) {
    case "environment":
      return environmentName.test(definition.name);
    case "prefix": {
      const words = [definition.command, ...definition.argv];
      return areValidRawWords(words) && words.every((word) => !reservedWords.has(word));
    }
    case "argument":
      return (
        isValidFlag(definition.flag) && areValidRawWords(definition.argv) && !definition.argv.includes("%command%")
      );
  }
};

export const renderLaunchOptionDefinition = (definition: LaunchOptionDefinition): string => {
  switch (definition.kind) {
    case "environment":
      return `${definition.name}=${renderWord(definition.value)}`;
    case "prefix":
      return [definition.command, ...definition.argv].join(" ");
    case "argument":
      return [definition.flag, ...definition.argv].join(" ");
  }
};

export const parseLaunchOptionDefinition = (source: string): LaunchOptionDefinition | undefined => {
  const raw = source.trim();
  const words = parseRawWords(raw);
  if (!words) return undefined;

  const parsed = parseLaunchOptions(`${raw} %command%`);
  if (parsed.diagnostics.length > 0) return undefined;
  if (parsed.assignments.length > 0) {
    if (parsed.assignments.length !== 1 || parsed.prefixes.length > 0) return undefined;
    const { name, value } = parsed.assignments[0];
    if (value === undefined) return undefined;
    const definition = { kind: "environment" as const, name, value };
    return isValidLaunchOption(definition) ? definition : undefined;
  }

  const [first, ...argv] = words;
  if (first.includes("=")) return undefined;
  const definition: LaunchOptionDefinition = first.startsWith("-")
    ? { kind: "argument", flag: first, argv }
    : { kind: "prefix", command: first, argv };
  return isValidLaunchOption(definition) ? definition : undefined;
};

const prefixCommandMatches = (prefix: ParsedPrefix, command: string): boolean => prefix.words[0]?.raw === command;

const findWordSequenceSpans = (
  words: readonly { raw: string; span: SourceSpan }[],
  sequence: readonly string[],
  start = 0,
): SourceSpan[] => {
  if (sequence.length === 0) return [];
  const spans: SourceSpan[] = [];
  for (let index = start; index <= words.length - sequence.length; ) {
    if (!sequence.every((expected, offset) => words[index + offset].raw === expected)) {
      index++;
      continue;
    }
    spans.push({ start: words[index].span.start, end: words[index + sequence.length - 1].span.end });
    index += sequence.length;
  }
  return spans;
};

const findDefinitionSpans = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): SourceSpan[] => {
  switch (definition.kind) {
    case "environment":
      return parsed.assignments
        .filter((assignment) => assignment.name === definition.name && assignment.value === definition.value)
        .map((assignment) => assignment.span);
    case "prefix":
      return parsed.prefixes.flatMap((prefix) => {
        if (!prefixCommandMatches(prefix, definition.command)) return [];
        return definition.argv.length === 0
          ? [prefix.words[0].span]
          : findWordSequenceSpans(prefix.words, definition.argv, 1);
      });
    case "argument":
      return findWordSequenceSpans(parsed.arguments, [definition.flag, ...definition.argv]);
  }
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
    if (word.raw !== definition.flag) continue;
    let end = word.span.end;
    let consumed = 0;
    while (consumed < definition.argv.length) {
      const next = parsed.arguments[index + consumed + 1];
      if (!next || next.raw.startsWith("-")) break;
      end = next.span.end;
      consumed++;
    }
    edits.push({ span: leadingOwnedSpan(parsed.source, { start: word.span.start, end }), replacement: "" });
    index += consumed;
  }
  return edits;
};

const environmentDeletionEdits = (parsed: ParsedLaunchOptions, name: string): TextEdit[] =>
  parsed.assignments
    .filter((assignment) => assignment.name === name)
    .map((assignment) => ({ span: leadingOwnedSpan(parsed.source, assignment.span), replacement: "" }));

const prefixDefinitionDeletionEdits = (
  parsed: ParsedLaunchOptions,
  definition: Extract<LaunchOptionDefinition, { kind: "prefix" }>,
): TextEdit[] => {
  const edits: TextEdit[] = [];
  for (let index = 0; index < parsed.prefixes.length; index++) {
    const prefix = parsed.prefixes[index];
    if (!prefixCommandMatches(prefix, definition.command)) continue;
    if (definition.argv.length === 0) {
      edits.push({ span: prefixDeletionSpan(parsed, index), replacement: "" });
      continue;
    }
    const matches = findWordSequenceSpans(prefix.words, definition.argv, 1);
    if (matches.length === 0) continue;
    const remainingWords = prefix.words.length - matches.length * definition.argv.length;
    if (remainingWords === 1) edits.push({ span: prefixDeletionSpan(parsed, index), replacement: "" });
    else {
      edits.push(...matches.map((span) => ({ span: leadingOwnedSpan(parsed.source, span), replacement: "" })));
    }
  }
  return edits;
};

const removeDefinitionEdits = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit[] => {
  switch (definition.kind) {
    case "environment":
      return environmentDeletionEdits(parsed, definition.name);
    case "prefix":
      return prefixDefinitionDeletionEdits(parsed, definition);
    case "argument":
      return findDefinitionSpans(parsed, definition).map((span) => ({
        span: leadingOwnedSpan(parsed.source, span),
        replacement: "",
      }));
  }
};

const replacementDeletionEdits = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit[] => {
  switch (definition.kind) {
    case "environment":
      return environmentDeletionEdits(parsed, definition.name);
    case "argument":
      return argumentSlotEdits(parsed, definition);
    case "prefix":
      return [];
  }
};

const insertionEdit = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit => {
  const rendered = renderLaunchOptionDefinition(definition);
  if (parsed.implicitMarker) {
    const replacement = definition.kind === "argument" ? `%command% ${rendered}` : `${rendered} %command%`;
    return { span: { start: 0, end: parsed.source.length }, replacement };
  }
  if (!parsed.marker) throw new Error("editable launch options must have a marker");
  if (definition.kind === "environment") {
    const position = parsed.prefixes[0]?.span.start ?? parsed.marker.span.start;
    return { span: { start: position, end: position }, replacement: `${rendered} ` };
  }
  if (definition.kind === "prefix") {
    const existing = parsed.prefixes.find((prefix) => prefixCommandMatches(prefix, definition.command));
    if (existing && definition.argv.length > 0) {
      return {
        span: { start: existing.span.end, end: existing.span.end },
        replacement: ` ${definition.argv.join(" ")}`,
      };
    }
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

export class LaunchOptions {
  private readonly parsed: ParsedLaunchOptions;

  private constructor(private readonly source: string) {
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
    if (!this.editable) return false;
    if (definition.kind === "environment") return this.getEnvironment(definition.name) === definition.value;
    return findDefinitionSpans(this.parsed, definition).length > 0;
  }

  setEnabled(definition: LaunchOptionDefinition, enabled: boolean): LaunchOptionsEditResult {
    return this.edit([{ kind: enabled ? "enable" : "disable", definition }]);
  }

  replaceDefinition(previous: LaunchOptionDefinition, next: LaunchOptionDefinition): LaunchOptionsEditResult {
    if (!this.editable) return { ok: false, value: this, error: "document-not-editable" };
    if (!this.isEnabled(previous)) return { ok: true, value: this, changed: false };
    return this.edit([
      { kind: "disable", definition: previous },
      { kind: "enable", definition: next },
    ]);
  }

  getEnvironment(name: string): string | undefined {
    return this.parsed.assignments.filter((assignment) => assignment.name === name).slice(-1)[0]?.value;
  }

  hasEnvironment(name: string): boolean {
    return this.parsed.assignments.some((assignment) => assignment.name === name);
  }

  edit(edits: readonly LaunchOptionsEdit[]): LaunchOptionsEditResult {
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

  private applyOne(edit: LaunchOptionsEdit): LaunchOptionsEditResult {
    if (!isValidLaunchOption(edit.definition)) {
      return { ok: false, value: this, error: "invalid-definition" };
    }
    if (edit.kind === "disable") {
      const deletions = removeDefinitionEdits(this.parsed, edit.definition);
      if (deletions.length === 0) return { ok: true, value: this, changed: false };
      return this.finish(applyTextEdits(this.source, deletions));
    }
    const matches = findDefinitionSpans(this.parsed, edit.definition);
    if (this.isCanonical(edit.definition, matches.length)) return { ok: true, value: this, changed: false };
    const withoutSlot = applyTextEdits(this.source, replacementDeletionEdits(this.parsed, edit.definition));
    const intermediate = LaunchOptions.parse(withoutSlot);
    if (!intermediate.editable) return { ok: false, value: this, error: "invalid-result" };
    return this.finish(applyTextEdits(withoutSlot, [insertionEdit(intermediate.parsed, edit.definition)]));
  }

  private isCanonical(definition: LaunchOptionDefinition, matchCount: number): boolean {
    if (definition.kind === "prefix") return matchCount > 0;
    if (matchCount !== 1) return false;
    if (definition.kind === "environment") {
      return this.parsed.assignments.filter((assignment) => assignment.name === definition.name).length === 1;
    }
    return this.parsed.arguments.filter((word) => word.raw === definition.flag).length === 1;
  }

  private finish(source: string): LaunchOptionsEditResult {
    const normalized = source.trim() === "%command%" ? "" : source;
    const value = LaunchOptions.parse(normalized);
    if (!value.editable) return { ok: false, value: this, error: "invalid-result" };
    return { ok: true, value, changed: normalized !== this.source };
  }
}
