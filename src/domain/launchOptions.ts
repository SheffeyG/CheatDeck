export type OptionType = "env" | "pre_cmd" | "flag_args";

export interface LaunchOption {
  type: OptionType;
  key: string;
  value?: string;
}

export type LaunchOptionsEditFailure = "missing-command-marker" | "invalid-custom-option";

export type LaunchOptionsEditResult =
  | { ok: true; value: LaunchOptions }
  | { ok: false; value: LaunchOptions; error: LaunchOptionsEditFailure };

interface Token {
  start: number;
  end: number;
  raw: string;
  value: string;
  complete: boolean;
}

interface Entry {
  type: OptionType;
  key: string;
  value?: string;
  start: number;
  end: number;
  tokens: string[];
  separatorBefore?: Token;
  separatorAfter?: Token;
}

interface ParsedSource {
  marker?: Token;
  markerCount: number;
  entries: Entry[];
  prefixEntries: Entry[];
}

interface Patch {
  start: number;
  end: number;
  replacement: string;
}

interface ManagedEntry {
  type: OptionType;
  key: string;
  value?: string;
  rendered: string;
  exactValue?: boolean;
}

const keys = {
  trainer: "PROTON_REMOTE_DEBUG_CMD",
  trainerDirectory: "PRESSURE_VESSEL_FILESYSTEMS_RW",
  language: "LANG",
  hostLanguage: "HOST_LC_ALL",
  compatibilityPath: "STEAM_COMPAT_DATA_PATH",
  dxvkAsync: "DXVK_ASYNC",
  radvPerftest: "RADV_PERFTEST",
} as const;

const commands = {
  losslessScaling: "~/lsfg",
  framegenPatch: "~/fgmod/fgmod",
  framegenUnpatch: "~/fgmod/fgmod-uninstaller.sh",
} as const;

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

const lex = (source: string): Token[] => {
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

const envEntry = (token: Token): Entry | undefined => {
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

const parseSource = (source: string): ParsedSource => {
  const tokens = lex(source);
  const markerIndexes = tokens
    .map((token, index) => (token.complete && token.raw === "%command%" ? index : -1))
    .filter((index) => index >= 0);
  const markerIndex = markerIndexes[0];
  const marker = markerIndex === undefined ? undefined : tokens[markerIndex];
  if (!marker) return { markerCount: 0, entries: [], prefixEntries: [] };

  const entries: Entry[] = [];
  const prefixEntries: Entry[] = [];
  let prefixTokens: Token[] = [];
  let prefixZone: Entry[] = [];
  let pendingSeparator: Token | undefined;

  const resetPrefixZone = () => {
    prefixZone = [];
    pendingSeparator = undefined;
  };

  const pushPrefix = () => {
    if (prefixTokens.length === 0) return;
    const entry: Entry = {
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

    const env = envEntry(token);
    if (env) {
      pushPrefix();
      resetPrefixZone();
      entries.push(env);
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

const mergeDeletionPatches = (patches: Patch[]): Patch[] => {
  const sorted = [...patches].sort((left, right) => left.start - right.start || left.end - right.end);
  const merged: Patch[] = [];

  for (const patch of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && !previous.replacement && !patch.replacement && patch.start <= previous.end) {
      previous.end = Math.max(previous.end, patch.end);
    } else {
      merged.push({ ...patch });
    }
  }

  return merged;
};

const applyPatches = (source: string, patches: Patch[]): string =>
  mergeDeletionPatches(patches)
    .sort((left, right) => right.start - left.start || right.end - left.end)
    .reduce((current, patch) => current.slice(0, patch.start) + patch.replacement + current.slice(patch.end), source);

const escapeDoubleQuoted = (value: string): string => value.replace(/[\\"$`]/g, "\\$&");

const quoteShellArgument = (value: string): string => `'${value.split("'").join(`'"'"'`)}'`;

const renderFlagValue = (value: string): string =>
  /^[A-Za-z0-9_.,:@%+/-]+$/.test(value) && !value.startsWith("-") ? value : `"${escapeDoubleQuoted(value)}"`;

const renderEnvValue = (value: string): string =>
  /^[A-Za-z0-9_.,:@%+/-]*$/.test(value) ? value : `"${escapeDoubleQuoted(value)}"`;

const parentPath = (path: string): string => {
  const separator = path.lastIndexOf("/");
  if (separator < 0) return ".";
  return separator === 0 ? path[0] : path.slice(0, separator);
};

const unwrapTrainerPath = (value: string | undefined): string | undefined => {
  if (value?.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).split(`'"'"'`).join("'");
  return value;
};

export class LaunchOptions {
  readonly #source: string;
  readonly #parsed: ParsedSource;

  private constructor(source: string) {
    this.#source = source;
    this.#parsed = parseSource(source);
  }

  static parse(source: string): LaunchOptions {
    return new LaunchOptions(source);
  }

  toString(): string {
    return this.#source.trim() === "%command%" ? "" : this.#source;
  }

  get trainerPath(): string | undefined {
    return unwrapTrainerPath(this.findEntries("env", keys.trainer)[0]?.value);
  }

  get trainerDirectory(): string | undefined {
    return this.findEntries("env", keys.trainerDirectory)[0]?.value;
  }

  get language(): string | undefined {
    return this.findEntries("env", keys.language)[0]?.value;
  }

  get compatibilityPath(): string | undefined {
    return this.findEntries("env", keys.compatibilityPath)[0]?.value;
  }

  get isTrainerEnabled(): boolean {
    return this.findEntries("env", keys.trainer).length > 0;
  }

  get isLanguageEnabled(): boolean {
    return this.findEntries("env", keys.language).length > 0 || this.findEntries("env", keys.hostLanguage).length > 0;
  }

  get isDxvkAsyncEnabled(): boolean {
    return this.hasEntry({ type: "env", key: keys.dxvkAsync, value: "1" });
  }

  get isRadvPerftestEnabled(): boolean {
    return this.hasEntry({ type: "env", key: keys.radvPerftest, value: "gpl" });
  }

  get isLosslessScalingEnabled(): boolean {
    return this.hasEntry({ type: "pre_cmd", key: commands.losslessScaling });
  }

  get isFramegenPatchEnabled(): boolean {
    return this.hasEntry({ type: "pre_cmd", key: commands.framegenPatch });
  }

  get isFramegenUnpatchEnabled(): boolean {
    return this.hasEntry({ type: "pre_cmd", key: commands.framegenUnpatch });
  }

  setTrainer(path: string): LaunchOptionsEditResult {
    const directory = parentPath(path);
    const quotedPath = quoteShellArgument(path);
    return this.edit([
      {
        type: "env",
        key: keys.trainer,
        value: quotedPath,
        rendered: `${keys.trainer}="${escapeDoubleQuoted(quotedPath)}"`,
      },
      {
        type: "env",
        key: keys.trainerDirectory,
        value: directory,
        rendered: `${keys.trainerDirectory}="${escapeDoubleQuoted(directory)}"`,
      },
    ]);
  }

  disableTrainer(): LaunchOptionsEditResult {
    return this.edit(
      [],
      [
        { type: "env", key: keys.trainer },
        { type: "env", key: keys.trainerDirectory },
      ],
    );
  }

  setLanguage(value: string): LaunchOptionsEditResult {
    const rendered = renderEnvValue(value);
    return this.edit([
      { type: "env", key: keys.language, value, rendered: `${keys.language}=${rendered}` },
      { type: "env", key: keys.hostLanguage, value, rendered: `${keys.hostLanguage}=${rendered}` },
    ]);
  }

  disableLanguage(): LaunchOptionsEditResult {
    return this.edit(
      [],
      [
        { type: "env", key: keys.language },
        { type: "env", key: keys.hostLanguage },
      ],
    );
  }

  setCompatibilityPath(path: string): LaunchOptionsEditResult {
    return this.edit([
      {
        type: "env",
        key: keys.compatibilityPath,
        value: path,
        rendered: `${keys.compatibilityPath}="${escapeDoubleQuoted(path)}"`,
      },
    ]);
  }

  disableCompatibilityPath(): LaunchOptionsEditResult {
    return this.edit([], [{ type: "env", key: keys.compatibilityPath }]);
  }

  setDxvkAsync(enabled: boolean): LaunchOptionsEditResult {
    return this.toggle({ type: "env", key: keys.dxvkAsync, value: "1", rendered: `${keys.dxvkAsync}=1` }, enabled);
  }

  setRadvPerftest(enabled: boolean): LaunchOptionsEditResult {
    return this.toggle(
      { type: "env", key: keys.radvPerftest, value: "gpl", rendered: `${keys.radvPerftest}=gpl` },
      enabled,
    );
  }

  setLosslessScaling(enabled: boolean): LaunchOptionsEditResult {
    return this.toggle({ type: "pre_cmd", key: commands.losslessScaling, rendered: commands.losslessScaling }, enabled);
  }

  setFramegenPatch(enabled: boolean): LaunchOptionsEditResult {
    return this.edit(
      enabled ? [{ type: "pre_cmd", key: commands.framegenPatch, rendered: commands.framegenPatch }] : [],
      enabled
        ? [{ type: "pre_cmd", key: commands.framegenUnpatch }]
        : [{ type: "pre_cmd", key: commands.framegenPatch }],
    );
  }

  setFramegenUnpatch(enabled: boolean): LaunchOptionsEditResult {
    return this.edit(
      enabled ? [{ type: "pre_cmd", key: commands.framegenUnpatch, rendered: commands.framegenUnpatch }] : [],
      enabled
        ? [{ type: "pre_cmd", key: commands.framegenPatch }]
        : [{ type: "pre_cmd", key: commands.framegenUnpatch }],
    );
  }

  isCustomOptionEnabled(option: LaunchOption): boolean {
    const normalized = this.normalizeCustomOption(option);
    return normalized ? this.hasEntry(normalized) : false;
  }

  setCustomOption(option: LaunchOption, enabled: boolean): LaunchOptionsEditResult {
    const normalized = this.normalizeCustomOption(option);
    if (!normalized) return { ok: false, value: this, error: "invalid-custom-option" };
    return this.toggle(normalized, enabled);
  }

  private toggle(option: ManagedEntry, enabled: boolean): LaunchOptionsEditResult {
    return enabled ? this.edit([option]) : this.edit([], [option]);
  }

  private normalizeCustomOption(option: LaunchOption): ManagedEntry | undefined {
    if (!(["env", "pre_cmd", "flag_args"] as unknown[]).includes(option.type)) return undefined;
    const key = option.key.trim();
    if (!key || key !== option.key) return undefined;
    if (option.type === "pre_cmd" && option.value !== undefined) return undefined;

    const rendered =
      option.type === "env"
        ? `${key}=${option.value ?? ""}`
        : option.value === undefined
          ? key
          : `${key} ${renderFlagValue(option.value)}`;
    const source = option.type === "flag_args" ? `%command% ${rendered}` : `${rendered} %command%`;
    const parsed = parseSource(source);
    const entry = parsed.entries[0];
    const expectedStart = option.type === "flag_args" ? "%command% ".length : 0;
    const expectedEnd = expectedStart + rendered.length;
    const expectedValue = option.type === "env" ? (option.value ?? "") : option.value;

    if (
      parsed.markerCount !== 1 ||
      parsed.entries.length !== 1 ||
      !entry ||
      entry.type !== option.type ||
      (option.type !== "pre_cmd" && entry.key !== key) ||
      entry.value !== expectedValue ||
      entry.start !== expectedStart ||
      entry.end !== expectedEnd
    ) {
      return undefined;
    }

    return {
      type: entry.type,
      key: option.type === "pre_cmd" ? key : entry.key,
      value: entry.value,
      rendered,
      exactValue: true,
    };
  }

  private hasEntry(option: Pick<ManagedEntry, "type" | "key" | "value">): boolean {
    return this.findEntries(option.type, option.key).some((entry) => entry.value === option.value);
  }

  private findEntries(type: OptionType, key: string): Entry[] {
    if (type === "pre_cmd") {
      const desired = lex(key)
        .filter((token) => token.complete)
        .map((token) => token.value);
      return this.#parsed.entries.filter(
        (entry) => entry.type === type && entry.tokens.join("\0") === desired.join("\0"),
      );
    }
    return this.#parsed.entries.filter((entry) => entry.type === type && entry.key === key);
  }

  private matchingEntries(option: Pick<ManagedEntry, "type" | "key" | "value" | "exactValue">): Entry[] {
    const matches = this.findEntries(option.type, option.key);
    return option.exactValue ? matches.filter((entry) => entry.value === option.value) : matches;
  }

  private edit(
    upserts: ManagedEntry[],
    removals: Array<Pick<ManagedEntry, "type" | "key" | "value" | "exactValue">> = [],
  ): LaunchOptionsEditResult {
    const isBlank = this.#source.trim() === "";
    if (!isBlank && this.#parsed.markerCount !== 1) {
      return { ok: false, value: this, error: "missing-command-marker" };
    }

    if (isBlank && upserts.length === 0) return { ok: true, value: this };
    const initial = isBlank ? LaunchOptions.parse("%command%") : this;
    const withoutRemoved = removals.reduce((current, removal) => current.removeAll(removal), initial);
    const value = upserts.reduce((current, upsert) => current.upsert(upsert), withoutRemoved);
    return { ok: true, value };
  }

  private removeAll(option: Pick<ManagedEntry, "type" | "key" | "value" | "exactValue">): LaunchOptions {
    const matches = this.matchingEntries(option);
    if (matches.length === 0) return this;
    return LaunchOptions.parse(
      applyPatches(
        this.#source,
        matches.map((entry) => this.deletionPatch(entry)),
      ),
    );
  }

  private upsert(option: ManagedEntry): LaunchOptions {
    // Enabling a value replaces every existing entry with the same type and key.
    // Exact-value matching is only for checked state and disabling.
    const matches = this.findEntries(option.type, option.key);
    if (matches.length === 0) return this.insert(option);

    const [first, ...duplicates] = matches;
    const patches = duplicates.map((entry) => this.deletionPatch(entry));
    if (first.value !== option.value) {
      patches.push({ start: first.start, end: first.end, replacement: option.rendered });
    }
    return patches.length === 0 ? this : LaunchOptions.parse(applyPatches(this.#source, patches));
  }

  private insert(option: ManagedEntry): LaunchOptions {
    const marker = this.#parsed.marker;
    if (!marker) return this;

    if (option.type === "flag_args") {
      return LaunchOptions.parse(
        `${this.#source.slice(0, marker.end)} ${option.rendered}${this.#source.slice(marker.end)}`,
      );
    }

    if (option.type === "pre_cmd") {
      const firstPrefix = this.#parsed.prefixEntries[0];
      const position = firstPrefix?.start ?? marker.start;
      const rendered = firstPrefix ? `${option.rendered} -- ` : `${option.rendered} `;
      return LaunchOptions.parse(`${this.#source.slice(0, position)}${rendered}${this.#source.slice(position)}`);
    }

    const position = this.#parsed.prefixEntries[0]?.start ?? marker.start;
    return LaunchOptions.parse(`${this.#source.slice(0, position)}${option.rendered} ${this.#source.slice(position)}`);
  }

  private deletionPatch(entry: Entry): Patch {
    if (entry.type !== "pre_cmd") return { start: entry.start, end: entry.end, replacement: "" };
    if (entry.separatorBefore) {
      return { start: entry.separatorBefore.start, end: entry.end, replacement: "" };
    }
    if (entry.separatorAfter) {
      return { start: entry.start, end: entry.separatorAfter.end, replacement: "" };
    }
    return { start: entry.start, end: entry.end, replacement: "" };
  }
}
