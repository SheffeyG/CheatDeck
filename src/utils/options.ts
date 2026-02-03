import { logger } from "./logger";

export class Options {
  #parsedOptions: LaunchOption[] = [];

  constructor(input: string) {
    const match = input.match(/(.*)%command%(.*)/);
    const beforeCommand = match ? match[1].trim() : input;
    const afterCommand = match ? match[2].trim() : "";

    if (beforeCommand) {
      const tokens = this.tokenize(beforeCommand);
      const options = this.parseTokens(tokens, "before");
      this.#parsedOptions.push(...options);
    }

    if (afterCommand) {
      const tokens = this.tokenize(afterCommand);
      const options = this.parseTokens(tokens, "after");
      this.#parsedOptions.push(...options);
    }
  }

  private tokenize(text: string): string[] {
    if (!text) return [];

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

  private parseTokens(tokens: string[], position: OptionPosition): LaunchOption[] {
    if (!tokens) return [];

    const options: LaunchOption[] = [];
    let prefix: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      const next = tokens[i + 1];

      if (position === "before") {
        // Enviroment values
        if (current.includes("=") && !current.startsWith("-")) {
          const [key, ...valueParts] = current.split("=");
          const value = valueParts.join("=");
          options.push({ type: "env", key: key.trim(), value: value });
        // Prefix commands
        } else if (current === "--") {
          if (prefix.length > 0) {
            options.push({ type: "pre_cmd", key: prefix.join(" ") });
          }
          prefix = [];
        } else {
          prefix.push(current);
        }
      }

      if (position === "after") {
        // Flags with/without arguments
        if (current.startsWith("-")) {
          if (next && !next.startsWith("-")) {
            options.push({ type: "flag_args", key: current, value: next });
            i++;
          } else {
            options.push({ type: "flag_args", key: current });
          }
        } else {
          logger.error("Unexcepted token after '%command%':", current);
        }
      }
    }

    // Take the rest tokens as the last prefix command
    if (prefix.length > 0) {
      options.push({ type: "pre_cmd", key: prefix.join(" ") });
    }

    return options;
  }

  getParsedOptions(): LaunchOption[] {
    return this.#parsedOptions;
  }

  setOption(opt: LaunchOption): void {
    this.removeOptionByKey(opt.key);
    this.#parsedOptions.push(opt);
  }

  removeOptionByKey(key: string): void {
    this.#parsedOptions = this.#parsedOptions.filter(p => p.key !== key);
  }

  hasKey(key: string): boolean {
    return this.#parsedOptions.some(p => p.key === key);
  }

  hasKeyValue(key: string, value: string): boolean {
    return this.#parsedOptions.some(p => p.key === key && p.value === value);
  }

  getKeyValue(key: string): string | undefined {
    const param = this.#parsedOptions.find(p => p.key === key);
    return param?.value;
  }

  getOptionsString(): string {
    const envString = this.#parsedOptions
      .filter(opt => opt.type === "env")
      .map(opt => `${opt.key}=${opt.value}`)
      .join(" ");

    const preCmdString = this.#parsedOptions
      .filter(opt => opt.type === "pre_cmd")
      .map(opt => opt.key)
      .join(" -- ");

    const flagArgsString = this.#parsedOptions
      .filter(opt => opt.type === "flag_args")
      .map(opt => opt.value ? `${opt.key} ${opt.value}` : opt.key)
      .join(" ");

    const optionsString = [envString, preCmdString, "%command%", flagArgsString]
      .filter(part => part) // filter empty parts
      .join(" ")
      .trim();

    if (optionsString === "%command%") return "";

    return optionsString;
  }
}
