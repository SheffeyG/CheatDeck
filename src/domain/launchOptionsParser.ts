export type OptionType = "env" | "pre_cmd" | "flag_args";

export interface LaunchOption {
  type: OptionType;
  key: string;
  value?: string;
}

interface Token {
  start: number;
  end: number;
  raw: string;
  value: string;
  complete: boolean;
}

export interface ParsedLaunchOptionEntry {
  type: OptionType;
  key: string;
  value?: string;
  start: number;
  end: number;
  tokens: string[];
  separatorBefore?: Token;
  separatorAfter?: Token;
}

export interface ParsedLaunchOptions {
  marker?: Token;
  markerCount: number;
  entries: ParsedLaunchOptionEntry[];
  prefixEntries: ParsedLaunchOptionEntry[];
}

const decodeFragment = (raw: string): { value: string; complete: boolean } => {
  let value = "";
  let quote = "";

  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (char === "\\") {
      if (index + 1 >= raw.length) return { value, complete: false };
      value += raw[index + 1];
      index++;
    } else if (quote) {
      if (char === quote) quote = "";
      else value += char;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else {
      value += char;
    }
  }

  return { value, complete: quote === "" };
};

export const tokenizeLaunchOptions = (source: string): Token[] => {
  const tokens: Token[] = [];
  let start: number | undefined;
  let quote = "";
  let escaped = false;

  const pushToken = (end: number) => {
    if (start === undefined) return;
    const raw = source.slice(start, end);
    tokens.push({ start, end, raw, ...decodeFragment(raw) });
    start = undefined;
  };

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (start === undefined) {
      if (/\s/.test(char)) continue;
      start = index;
    }

    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (/\s/.test(char)) {
      pushToken(index);
    }
  }

  pushToken(source.length);
  return tokens;
};

const findUnquotedEquals = (raw: string): number => {
  let quote = "";
  let escaped = false;

  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (escaped) escaped = false;
    else if (char === "\\") escaped = true;
    else if (quote && char === quote) quote = "";
    else if (!quote && (char === '"' || char === "'")) quote = char;
    else if (!quote && char === "=") return index;
  }

  return -1;
};

const parseEnvironmentEntry = (token: Token): ParsedLaunchOptionEntry | undefined => {
  if (!token.complete || token.value.startsWith("-")) return undefined;
  const equals = findUnquotedEquals(token.raw);
  if (equals <= 0) return undefined;

  const key = decodeFragment(token.raw.slice(0, equals));
  const value = decodeFragment(token.raw.slice(equals + 1));
  if (!key.complete || !value.complete || !key.value) return undefined;

  return {
    type: "env",
    key: key.value,
    value: value.value,
    start: token.start,
    end: token.end,
    tokens: [token.value],
  };
};

const isNegativeNumber = (value: string): boolean => /^-\d+(?:\.\d+)?$/.test(value);

const isFlagToken = (token: Token | undefined): token is Token => {
  if (!token) return false;
  return token.complete && token.raw.startsWith("-") && token.value.startsWith("-");
};

export const parseLaunchOptions = (source: string): ParsedLaunchOptions => {
  const tokens = tokenizeLaunchOptions(source);
  const markerIndexes = tokens
    .map((token, index) => (token.complete && token.raw === "%command%" ? index : -1))
    .filter((index) => index >= 0);
  const markerIndex = markerIndexes[0];
  const marker = markerIndex === undefined ? undefined : tokens[markerIndex];
  if (!marker) return { markerCount: 0, entries: [], prefixEntries: [] };

  const entries: ParsedLaunchOptionEntry[] = [];
  const prefixEntries: ParsedLaunchOptionEntry[] = [];
  let prefixTokens: Token[] = [];
  let prefixZone: ParsedLaunchOptionEntry[] = [];
  let pendingSeparator: Token | undefined;

  const resetPrefixZone = () => {
    prefixZone = [];
    pendingSeparator = undefined;
  };

  const pushPrefix = () => {
    if (prefixTokens.length === 0) return;
    const entry: ParsedLaunchOptionEntry = {
      type: "pre_cmd",
      key: prefixTokens.map((token) => token.value).join(" "),
      start: prefixTokens[0].start,
      end: prefixTokens[prefixTokens.length - 1].end,
      tokens: prefixTokens.map((token) => token.value),
    };
    if (pendingSeparator) entry.separatorBefore = pendingSeparator;
    entries.push(entry);
    prefixEntries.push(entry);
    prefixZone.push(entry);
    prefixTokens = [];
    pendingSeparator = undefined;
  };

  for (const token of tokens.slice(0, markerIndex)) {
    if (!token.complete) {
      pushPrefix();
      resetPrefixZone();
      continue;
    }
    if (token.raw === "--") {
      pushPrefix();
      const previous = prefixZone[prefixZone.length - 1];
      if (previous) previous.separatorAfter = token;
      pendingSeparator = token;
      continue;
    }

    const environment = parseEnvironmentEntry(token);
    if (environment) {
      pushPrefix();
      resetPrefixZone();
      entries.push(environment);
    } else {
      prefixTokens.push(token);
    }
  }
  pushPrefix();

  const after = tokens.slice(markerIndex + 1);
  for (let index = 0; index < after.length; index++) {
    const token = after[index];
    if (!isFlagToken(token)) continue;
    const next = after[index + 1];
    const hasValue = next?.complete && (!isFlagToken(next) || isNegativeNumber(next.value));
    entries.push({
      type: "flag_args",
      key: token.value,
      value: hasValue ? next.value : undefined,
      start: token.start,
      end: hasValue ? next.end : token.end,
      tokens: hasValue ? [token.value, next.value] : [token.value],
    });
    if (hasValue) index++;
  }

  return { marker, markerCount: markerIndexes.length, entries, prefixEntries };
};
