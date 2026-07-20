export interface SourceSpan {
  start: number;
  end: number;
}

type ParseDiagnosticCode =
  | "unterminated-single-quote"
  | "unterminated-double-quote"
  | "unterminated-expansion"
  | "unterminated-backtick"
  | "trailing-escape"
  | "unsupported-operator"
  | "unsupported-comment"
  | "unsupported-dollar-quote"
  | "unsupported-newline"
  | "missing-command-marker"
  | "multiple-command-markers"
  | "empty-prefix-command";

export interface ParseDiagnostic {
  code: ParseDiagnosticCode;
  span: SourceSpan;
}

interface ParsedWord {
  span: SourceSpan;
  raw: string;
  literal?: string;
}

interface ParsedAssignment {
  span: SourceSpan;
  name: string;
  value?: string;
}

export interface ParsedPrefix {
  span: SourceSpan;
  separatorBefore?: SourceSpan;
  separatorAfter?: SourceSpan;
  words: readonly ParsedWord[];
}

export interface ParsedLaunchOptions {
  source: string;
  assignments: readonly ParsedAssignment[];
  prefixes: readonly ParsedPrefix[];
  marker?: ParsedWord;
  implicitMarker: boolean;
  arguments: readonly ParsedWord[];
  diagnostics: readonly ParseDiagnostic[];
}

type WordPart =
  | { kind: "bare"; raw: string }
  | { kind: "literal"; value: string }
  | { kind: "dynamic" }
  | { kind: "continuation" };

interface InternalWord extends ParsedWord {
  parts: readonly WordPart[];
}

const span = (start: number, end: number): SourceSpan => ({ start, end });
const operators = new Set(["|", "&", ";", "<", ">", "(", ")"]);
const environmentName = /^[A-Za-z_][A-Za-z0-9_]*$/;
const shellActiveBare = /[*?[]/;

const scanBalanced = (source: string, start: number): { end: number; closed: boolean } => {
  const opening = source[start + 1];
  const closing = opening === "(" ? ")" : "}";
  let depth = 1;
  let quote = "";
  for (let index = start + 2; index < source.length; index++) {
    const char = source[index];
    if (char === "\\" && quote !== "'") {
      index++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"' || char === "`") quote = char;
    else if (char === opening) depth++;
    else if (char === closing && --depth === 0) return { end: index + 1, closed: true };
  }
  return { end: source.length, closed: false };
};

const scanDoubleQuote = (
  source: string,
  start: number,
  diagnostics: ParseDiagnostic[],
): { end: number; value?: string } => {
  let value = "";
  let dynamic = false;
  for (let index = start + 1; index < source.length; index++) {
    const char = source[index];
    if (char === '"') return { end: index + 1, value: dynamic ? undefined : value };
    if (char === "\\") {
      const next = source[index + 1];
      if (next === undefined) break;
      if (next === "\n") index++;
      else if (next === "$" || next === "`" || next === '"' || next === "\\") {
        value += next;
        index++;
      } else value += char;
    } else {
      if (char === "$" || char === "`") dynamic = true;
      value += char;
    }
  }
  diagnostics.push({ code: "unterminated-double-quote", span: span(start, source.length) });
  return { end: source.length };
};

const literalOf = (parts: readonly WordPart[]): string | undefined => {
  let value = "";
  for (const part of parts) {
    if (part.kind === "dynamic") return undefined;
    if (part.kind === "bare") {
      if ((value.length === 0 && part.raw.startsWith("~")) || shellActiveBare.test(part.raw)) return undefined;
      value += part.raw;
    } else if (part.kind === "literal") value += part.value;
  }
  return value;
};

const scanWord = (
  source: string,
  start: number,
  diagnostics: ParseDiagnostic[],
): { word: InternalWord; end: number } => {
  const parts: WordPart[] = [];
  let index = start;
  let bareStart = start;
  const pushBare = (end: number) => {
    if (bareStart < end) parts.push({ kind: "bare", raw: source.slice(bareStart, end) });
  };

  while (index < source.length) {
    const char = source[index];
    if (char === " " || char === "\t" || char === "\n" || operators.has(char)) break;
    if (char === "$" && (source[index + 1] === "'" || source[index + 1] === '"')) {
      diagnostics.push({ code: "unsupported-dollar-quote", span: span(index, index + 2) });
      index++;
      continue;
    }
    if (char === "\\") {
      pushBare(index);
      const next = source[index + 1];
      if (next === undefined) {
        diagnostics.push({ code: "trailing-escape", span: span(index, index + 1) });
        index++;
      } else if (next === "\n") {
        parts.push({ kind: "continuation" });
        index += 2;
      } else {
        parts.push({ kind: "literal", value: next });
        index += 2;
      }
      bareStart = index;
      continue;
    }
    if (char === "'") {
      pushBare(index);
      const close = source.indexOf("'", index + 1);
      const end = close < 0 ? source.length : close + 1;
      if (close < 0) diagnostics.push({ code: "unterminated-single-quote", span: span(index, end) });
      parts.push({
        kind: "literal",
        value: source.slice(index + 1, close < 0 ? end : close),
      });
      index = end;
      bareStart = index;
      continue;
    }
    if (char === '"') {
      pushBare(index);
      const quoted = scanDoubleQuote(source, index, diagnostics);
      parts.push(quoted.value === undefined ? { kind: "dynamic" } : { kind: "literal", value: quoted.value });
      index = quoted.end;
      bareStart = index;
      continue;
    }
    if (char === "`") {
      pushBare(index);
      let end = index + 1;
      while (end < source.length && source[end] !== "`") end += source[end] === "\\" ? 2 : 1;
      const closed = end < source.length;
      end = closed ? end + 1 : source.length;
      if (!closed) diagnostics.push({ code: "unterminated-backtick", span: span(index, end) });
      parts.push({ kind: "dynamic" });
      index = end;
      bareStart = index;
      continue;
    }
    if (char === "$" && (source[index + 1] === "{" || source[index + 1] === "(")) {
      pushBare(index);
      const balanced = scanBalanced(source, index);
      if (!balanced.closed) diagnostics.push({ code: "unterminated-expansion", span: span(index, balanced.end) });
      parts.push({ kind: "dynamic" });
      index = balanced.end;
      bareStart = index;
      continue;
    }
    if (char === "$" && source[index + 1] && /[-A-Za-z0-9_@*#?$!]/.test(source[index + 1])) {
      pushBare(index);
      let end = index + 2;
      if (/[A-Za-z_]/.test(source[index + 1])) while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end++;
      parts.push({ kind: "dynamic" });
      index = end;
      bareStart = index;
      continue;
    }
    index++;
  }
  pushBare(index);
  const raw = source.slice(start, index);
  return { word: { span: span(start, index), raw, literal: literalOf(parts), parts }, end: index };
};

const tokenize = (source: string, diagnostics: ParseDiagnostic[]): InternalWord[] => {
  const words: InternalWord[] = [];
  for (let index = 0; index < source.length; ) {
    const char = source[index];
    if (char === " " || char === "\t") index++;
    else if (char === "\n") {
      diagnostics.push({ code: "unsupported-newline", span: span(index, index + 1) });
      index++;
    } else if (operators.has(char)) {
      let end = index + 1;
      while (end < source.length && operators.has(source[end])) end++;
      diagnostics.push({ code: "unsupported-operator", span: span(index, end) });
      index = end;
    } else if (char === "#") {
      let end = index + 1;
      while (end < source.length && source[end] !== "\n") end++;
      diagnostics.push({ code: "unsupported-comment", span: span(index, end) });
      index = end;
    } else {
      const scanned = scanWord(source, index, diagnostics);
      if (!scanned.word.parts.every((part) => part.kind === "continuation")) words.push(scanned.word);
      index = scanned.end;
    }
  }
  return words;
};

const parseAssignment = (word: InternalWord): ParsedAssignment | undefined => {
  const first = word.parts[0];
  if (first?.kind !== "bare") return undefined;
  const equals = first.raw.indexOf("=");
  if (equals <= 0) return undefined;
  const name = first.raw.slice(0, equals);
  if (!environmentName.test(name)) return undefined;
  const remainder = first.raw.slice(equals + 1);
  const valueParts: WordPart[] = remainder
    ? [{ kind: "bare", raw: remainder }, ...word.parts.slice(1)]
    : [...word.parts.slice(1)];
  return { span: word.span, name, value: literalOf(valueParts) };
};

export const parseLaunchOptions = (source: string): ParsedLaunchOptions => {
  const diagnostics: ParseDiagnostic[] = [];
  const words = tokenize(source, diagnostics);
  if (/^[\t ]*$/.test(source) && diagnostics.length === 0) {
    return { source, assignments: [], prefixes: [], implicitMarker: true, arguments: [], diagnostics };
  }

  const markers = words.filter((word) => word.raw === "%command%" && word.literal === "%command%");
  if (markers.length !== 1) {
    diagnostics.push({
      code: markers.length === 0 ? "missing-command-marker" : "multiple-command-markers",
      span: markers.length === 0 ? span(0, source.length) : markers[1].span,
    });
  }
  if (diagnostics.length > 0 || markers.length !== 1) {
    return { source, assignments: [], prefixes: [], implicitMarker: false, arguments: [], diagnostics };
  }

  const marker = markers[0];
  const markerIndex = words.indexOf(marker);
  const assignments: ParsedAssignment[] = [];
  const prefixes: ParsedPrefix[] = [];
  let assignmentZone = true;
  let current: InternalWord[] = [];
  let separator: InternalWord | undefined;

  const pushPrefix = () => {
    if (current.length === 0) {
      if (separator) diagnostics.push({ code: "empty-prefix-command", span: separator.span });
      return;
    }
    prefixes.push({
      span: span(current[0].span.start, current[current.length - 1].span.end),
      separatorBefore: separator?.span,
      words: current,
    });
    current = [];
    separator = undefined;
  };

  const beforeMarker = words.slice(0, markerIndex);
  for (let index = 0; index < beforeMarker.length; index++) {
    const word = beforeMarker[index];
    if (word.raw === "--" && word.literal === "--") {
      assignmentZone = false;
      if (current.length === 0) diagnostics.push({ code: "empty-prefix-command", span: word.span });
      pushPrefix();
      if (index === beforeMarker.length - 1 && prefixes.length > 0) {
        prefixes[prefixes.length - 1].separatorAfter = word.span;
        separator = undefined;
        continue;
      }
      separator = word;
      continue;
    }
    const assignment = assignmentZone ? parseAssignment(word) : undefined;
    if (assignment) assignments.push(assignment);
    else {
      assignmentZone = false;
      current.push(word);
    }
  }
  pushPrefix();
  if (diagnostics.length > 0) {
    return { source, assignments: [], prefixes: [], implicitMarker: false, arguments: [], diagnostics };
  }
  return {
    source,
    assignments,
    prefixes,
    marker,
    implicitMarker: false,
    arguments: words.slice(markerIndex + 1),
    diagnostics,
  };
};

export const parseRawWords = (source: string): readonly [string, ...string[]] | undefined => {
  if (source.trim() !== source || source.length === 0) return undefined;
  const diagnostics: ParseDiagnostic[] = [];
  const words = tokenize(source, diagnostics);
  if (diagnostics.length > 0 || words.length === 0) return undefined;
  return words.map((word) => word.raw) as [string, ...string[]];
};
