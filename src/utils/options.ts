import { sendNotice } from "./client";
import logger from "./logger";
import t from "./translate";

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
    const others: string[] = [];
    let i = 0;

    while (i < tokens.length) {
      const current = tokens[i];
      const next = tokens[i + 1];

      if (current.includes("=") && !current.startsWith("-") && position === "before") {
        const [key, ...valueParts] = current.split("="); // Edge case: "ENV=a=b"
        const value = valueParts.join("=");
        params.push({ type: "env", key: key.trim(), value: value });
        i++;
        continue;
      }

      if (current.startsWith("-") && position === "after") {
        if (next && !next.startsWith("-")) { // flag with argument
          params.push({ type: "flag_args", key: current, value: next });
          i += 2;
        } else { // flag without argument
          params.push({ type: "flag_args", key: current });
          i++;
        }
        continue;
      }

      if (position === "before") {
        others.push(current);
      } else {
        logger.error("Unexcepted token after '%command%':", current);
      }
      i++;
    }

    // Let's say all the rest is pre_cmd parameter, put them all in key
    if (others.length > 0) {
      params.push({ type: "pre_cmd", key: others.join(" ") });
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

  getParameters(): ParsedParam[] {
    return this.#parsedParams;
  }

  setParameter(param: ParsedParam): void {
    if (param.type === "pre_cmd") {
      // For pre_cmd, remove the whole pre_cmd type parameters
      this.removeParamByType("pre_cmd");
    } else {
      this.removeParamByKey(param.key);
    }
    this.#parsedParams.push(param);
  }

  removeParamByKey(key: string): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.key !== key);
  }

  removeParamByType(type: OptionType): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.type !== type);
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
    const envString = this.#parsedParams.filter(param => param.type === "env")
      .map(param => `${param.key}=${param.value}`);
    const preCmdString = this.#parsedParams.filter(param => param.type === "pre_cmd")
      .map(param => param.key);
    const flagArgsString = this.#parsedParams.filter(param => param.type === "flag_args")
      .map(param => param.value ? `${param.key} ${param.value}` : param.key);

    const result = [...envString, ...preCmdString, "%command%", ...flagArgsString].join(" ").trim();

    // If there's no other launch options, return empty string
    if (result === "%command%") return "";

    return result;
  }

  saveOptions(appid: number) {
    if (this.#isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, this.getOptionsString());
      sendNotice(t("MESSAGE_SAVED", "Game launch options have been saved."));
    } else {
      sendNotice(t(
        "MESSAGE_NON_STEAM",
        "Warning: This is NOT a steam game! Settings will never be saved.",
      ));
    }
  }
}
