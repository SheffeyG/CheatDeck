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

export const isValidLaunchOption = (definition: LaunchOptionDefinition): boolean => {
  if (definition.kind === "environment") return environmentName.test(definition.name);
  if (definition.kind === "prefix") {
    const words = [definition.command, ...definition.argv];
    const parsed = parseRawWords(words.join(" "));
    return (
      parsed !== undefined &&
      parsed.length === words.length &&
      parsed.every((word, index) => word === words[index] && word !== "--" && word !== "%command%")
    );
  }
  if (
    !definition.flag.startsWith("-") ||
    definition.flag === "-" ||
    definition.flag === "--" ||
    !unquotedWord.test(definition.flag)
  ) {
    return false;
  }
  if (definition.argv.length === 0) return true;
  const parsed = parseRawWords(definition.argv.join(" "));
  return (
    parsed !== undefined &&
    parsed.length === definition.argv.length &&
    parsed.every((word, index) => word === definition.argv[index] && word !== "%command%")
  );
};

const renderDefinition = (definition: LaunchOptionDefinition): string => {
  switch (definition.kind) {
    case "environment":
      return `${definition.name}=${renderWord(definition.value)}`;
    case "prefix":
      return [definition.command, ...definition.argv].join(" ");
    case "argument":
      return [definition.flag, ...definition.argv].join(" ");
  }
};

const prefixCommandMatches = (
  prefix: ParsedPrefix,
  definition: Extract<LaunchOptionDefinition, { kind: "prefix" }>,
): boolean => prefix.words[0]?.raw === definition.command;

const prefixArgumentMatches = (prefix: ParsedPrefix, argv: readonly string[]): SourceSpan[] => {
  if (argv.length === 0) return [];
  const matches: SourceSpan[] = [];
  for (let index = 1; index <= prefix.words.length - argv.length; ) {
    if (argv.every((argument, offset) => prefix.words[index + offset].raw === argument)) {
      matches.push({ start: prefix.words[index].span.start, end: prefix.words[index + argv.length - 1].span.end });
      index += argv.length;
    } else index++;
  }
  return matches;
};

const findMatches = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): SourceSpan[] => {
  if (definition.kind === "environment") {
    return parsed.assignments
      .filter((assignment) => assignment.name === definition.name && assignment.value === definition.value)
      .map((assignment) => assignment.span);
  }
  if (definition.kind === "prefix") {
    return parsed.prefixes.flatMap((prefix) => {
      if (!prefixCommandMatches(prefix, definition)) return [];
      if (definition.argv.length === 0) return [prefix.words[0].span];
      return prefixArgumentMatches(prefix, definition.argv);
    });
  }
  const matches: SourceSpan[] = [];
  for (let index = 0; index < parsed.arguments.length; index++) {
    const word = parsed.arguments[index];
    if (word.raw !== definition.flag) continue;
    if (definition.argv.length === 0) {
      matches.push(word.span);
      continue;
    }
    if (definition.argv.every((argument, offset) => parsed.arguments[index + offset + 1]?.raw === argument)) {
      matches.push({ start: word.span.start, end: parsed.arguments[index + definition.argv.length].span.end });
      index += definition.argv.length;
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

const prefixDefinitionDeletionEdits = (
  parsed: ParsedLaunchOptions,
  definition: Extract<LaunchOptionDefinition, { kind: "prefix" }>,
): TextEdit[] => {
  const edits: TextEdit[] = [];
  for (let index = 0; index < parsed.prefixes.length; index++) {
    const prefix = parsed.prefixes[index];
    if (!prefixCommandMatches(prefix, definition)) continue;
    if (definition.argv.length === 0) {
      edits.push({ span: prefixDeletionSpan(parsed, index), replacement: "" });
      continue;
    }
    const matches = prefixArgumentMatches(prefix, definition.argv);
    if (matches.length === 0) continue;
    const remainingWords = prefix.words.length - matches.length * definition.argv.length;
    if (remainingWords === 1) edits.push({ span: prefixDeletionSpan(parsed, index), replacement: "" });
    else {
      edits.push(...matches.map((span) => ({ span: leadingOwnedSpan(parsed.source, span), replacement: "" })));
    }
  }
  return edits;
};

const exactDeletionEdits = (
  parsed: ParsedLaunchOptions,
  definition: Exclude<LaunchOptionDefinition, { kind: "environment" }>,
): TextEdit[] => {
  if (definition.kind === "prefix") return prefixDefinitionDeletionEdits(parsed, definition);
  return findMatches(parsed, definition).map((span) => ({
    span: leadingOwnedSpan(parsed.source, span),
    replacement: "",
  }));
};

const slotDeletionEdits = (parsed: ParsedLaunchOptions, definition: LaunchOptionDefinition): TextEdit[] => {
  if (definition.kind === "environment") {
    return parsed.assignments
      .filter((assignment) => assignment.name === definition.name)
      .map((assignment) => ({ span: leadingOwnedSpan(parsed.source, assignment.span), replacement: "" }));
  }
  if (definition.kind === "argument") return argumentSlotEdits(parsed, definition);
  return [];
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
  if (definition.kind === "prefix") {
    const existing = parsed.prefixes.find((prefix) => prefixCommandMatches(prefix, definition));
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
    return this.editable && isEnabled(this.parsed, definition);
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
      const deletions =
        edit.definition.kind === "environment"
          ? slotDeletionEdits(this.parsed, edit.definition)
          : exactDeletionEdits(this.parsed, edit.definition);
      if (deletions.length === 0) return { ok: true, value: this, changed: false };
      return this.finish(applyTextEdits(this.source, deletions));
    }
    const matches = findMatches(this.parsed, edit.definition);
    if (this.isCanonical(edit.definition, matches.length)) return { ok: true, value: this, changed: false };
    const withoutSlot = applyTextEdits(this.source, slotDeletionEdits(this.parsed, edit.definition));
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
