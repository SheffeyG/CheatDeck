import { logger } from "./logger";

type ParsedParam = LaunchOption;

export class Options {
  #parsedParams: ParsedParam[] = [];
  #isSteam: boolean;

  constructor(input: string) {
    this.#isSteam = this.detectSteamLauncher(input);
    this.#parsedParams = this.parseParameters(input);
  }

  private detectSteamLauncher(input: string): boolean {
    return !input.includes("heroicgameslauncher") && !input.includes("Emulation");
  }

  private parseParameters(input: string): ParsedParam[] {
    const match = input.match(/(.*)%command%(.*)/);
    const beforeCommand = match ? match[1].trim() : input;
    const afterCommand = match ? match[2].trim() : "";

    const params: ParsedParam[] = [];

    if (beforeCommand) {
      params.push(...this.parseTokens(beforeCommand, "before"));
    }

    if (afterCommand) {
      params.push(...this.parseTokens(afterCommand, "after"));
    }

    return params;
  }

  private parseTokens(text: string, position: OptionPosition): ParsedParam[] {
    if (!text) return [];

    const tokens = this.tokenize(text);
    const params: ParsedParam[] = [];
    let prefix: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      const next = tokens[i + 1];

      if (position === "before") {
        if (current.includes("=") && !current.startsWith("-")) {
          /* 1. Take all tokens with equal sign as ENV type
                note multip equal signs case "ENV=foo=bar" */
          const [key, ...valueParts] = current.split("=");
          const value = valueParts.join("=");
          params.push({ type: "env", key: key.trim(), value: value });
        } else if (current === "--") {
          /* 2. If separator "--" is found, push as one complete prefix command */
          if (prefix.length > 0) {
            params.push({ type: "pre_cmd", key: prefix.join(" ") });
          }
          prefix = [];
        } else {
          /* 3. Take all other tokens as pre_cmd, store them in a list */
          prefix.push(current);
        }
      }

      if (position === "after") {
        if (current.startsWith("-")) {
          if (next && !next.startsWith("-")) { // Flag with argument
            params.push({ type: "flag_args", key: current, value: next });
            i++;
          } else { // Flag without argument
            params.push({ type: "flag_args", key: current });
          }
        } else {
          logger.error("Unexcepted token after '%command%':", current);
        }
      }
    }

    // Push the rest of prefix tokens as the last pre_cmd
    if (prefix.length > 0) {
      params.push({ type: "pre_cmd", key: prefix.join(" ") });
    }

    return params;
  }

  private tokenize(text: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === "\\" && i + 1 < text.length) {
        current += char + text[i + 1];
        i++;
      } else if ((char === "\"" || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        current += char;
      } else if (char === " " && !inQuotes) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  isSteamGame(): boolean {
    return this.#isSteam;
  }

  getParameters(): ParsedParam[] {
    return this.#parsedParams;
  }

  setParameter(param: ParsedParam): void {
    this.removeParamByKey(param.key);
    this.#parsedParams.push(param);
  }

  removeParamByKey(key: string): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.key !== key);
  }

  hasKey(key: string): boolean {
    return this.#parsedParams.some(p => p.key === key);
  }

  hasKeyValue(key: string, value: string): boolean {
    return this.#parsedParams.some(p => p.key === key && p.value === value);
  }

  getKeyValue(key: string): string | undefined {
    const param = this.#parsedParams.find(p => p.key === key);
    return param?.value;
  }

  getOptionsString(): string {
    const envString = this.#parsedParams
      .filter(param => param.type === "env")
      .map(param => `${param.key}=${param.value}`)
      .join(" ");

    const preCmdString = this.#parsedParams
      .filter(param => param.type === "pre_cmd")
      .map(param => param.key)
      .join(" -- ");

    const flagArgsString = this.#parsedParams
      .filter(param => param.type === "flag_args")
      .map(param => param.value ? `${param.key} ${param.value}` : param.key)
      .join(" ");

    const optionsString = [envString, preCmdString, "%command%", flagArgsString]
      .filter(part => part) // Remove empty parts
      .join(" ")
      .trim();

    // If there's no other launch options, return empty string
    if (optionsString === "%command%") return "";

    return optionsString;
  }
}
