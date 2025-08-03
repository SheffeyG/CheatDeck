import { Backend } from "./backend";
import t from "./translate";

export type ParamType = 'env' | 'flag' | 'keyvalue';

export interface ParsedParam {
  type: ParamType;
  key: string;
  value?: string;
  position: 'before' | 'after';
  order: number;
}

export interface FlagParams {
  key: string;
  position?: 'before' | 'after';
}



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
    const afterCommand = match ? match[2].trim() : '';

    const params: ParsedParam[] = [];

    if (beforeCommand) {
      params.push(...this.parseTokens(beforeCommand, 'before'));
    }

    if (afterCommand) {
      params.push(...this.parseTokens(afterCommand, 'after'));
    }

    return params;
  }

  private parseTokens(text: string, position: 'before' | 'after'): ParsedParam[] {
    if (!text) return [];

    const tokens = this.tokenize(text);
    const params: ParsedParam[] = [];
    let order = 0;
    let i = 0;

    while (i < tokens.length) {
      const current = tokens[i];
      const next = tokens[i + 1];

      if (current.includes('=') && !current.startsWith('-')) {
        const [key, ...valueParts] = current.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        params.push({
          type: 'env',
          key: key.trim(),
          value,
          position,
          order: order++
        });
        i++;
        continue;
      }

      if (current.startsWith('-')) {
        if (next && !next.startsWith('-') && !next.includes('=')) {
          const value = next.replace(/^["']|["']$/g, '');
          params.push({
            type: 'keyvalue',
            key: current,
            value,
            position,
            order: order++
          });
          i += 2;
        } else {
          params.push({
            type: 'flag',
            key: current,
            position,
            order: order++
          });
          i++;
        }
        continue;
      }

      params.push({
        type: 'flag',
        key: current,
        position,
        order: order++
      });
      i++;
    }

    return params;
  }

  private tokenize(text: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        current += char;
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  hasFlag({ key, position = 'before' }: FlagParams): boolean {
    return this.#parsedParams.some(p => p.key === key && p.type === 'flag' && p.position === position);
  }

  setFlag({ key, position = 'before' }: FlagParams): void {
    this.#parsedParams.push({
      type: 'flag',
      key,
      position,
      order: this.#parsedParams.filter(p => p.position === position).length
    });
  }

  removeFlag({ key, position = 'before' }: FlagParams): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.key !== key || p.position !== position);
  }

  // Keep existing API fully compatible
  hasField(key: string): boolean {
    return this.#parsedParams.some(p => p.key === key);
  }

  hasFieldValue(key: string, value: string): boolean {
    return this.#parsedParams.some(p => p.key === key && p.value === value);
  }

  getFieldValue(key: string): string | undefined {
    const param = this.#parsedParams.find(p => p.key === key);
    return param?.value;
  }

  setFieldValue(key: string, value: string): string {
    const existingParam = this.#parsedParams.find(p => p.key === key);
    const oldValue = existingParam?.value || '';

    if (value.trim() === '') {
      this.#parsedParams = this.#parsedParams.filter(p => p.key !== key);
    } else if (existingParam) {
      if (existingParam.type === 'flag') {
        existingParam.type = key.startsWith('-') ? 'keyvalue' : 'env';
      }
      existingParam.value = value;
    } else {
      // Determine type based on key format and whether value is provided
      let type: ParamType;
      if (key.includes('=')) {
        // Should not happen in setFieldValue, but handle it
        type = 'env';
      } else if (key.startsWith('-')) {
        type = 'keyvalue';
      } else {
        // For non-dash keys, if value is provided, treat as env variable
        type = 'env';
      }

      this.#parsedParams.push({
        type,
        key,
        value,
        position: 'before',
        order: this.#parsedParams.filter(p => p.position === 'before').length
      });
    }

    return oldValue;
  }

  getOptionsString(): string {
    const sortedParams = [...this.#parsedParams].sort((a, b) => {
      if (a.position !== b.position) {
        return a.position === 'before' ? -1 : 1;
      }
      return a.order - b.order;
    });

    const beforeParams = sortedParams.filter(p => p.position === 'before');
    const afterParams = sortedParams.filter(p => p.position === 'after');

    const beforeString = this.paramsToString(beforeParams);
    const afterString = this.paramsToString(afterParams);

    let result = '';
    if (beforeString) result += beforeString + ' ';
    result += '%command%';
    if (afterString) result += ' ' + afterString;

    result = result.trim();

    // If the result is only %command%, return empty string
    if (result === '%command%') {
      return '';
    }

    return result;
  }

  private paramsToString(params: ParsedParam[]): string {
    return params.map(param => {
      switch (param.type) {
        case 'env':
          return `${param.key}=${this.quoteValue(param.value || '')}`;
        case 'keyvalue':
          return `${param.key} ${this.quoteValue(param.value || '')}`;
        case 'flag':
          return param.key;
        default:
          return param.key;
      }
    }).join(' ');
  }

  private quoteValue(value: string): string {
    if (value.includes(' ') || value.includes('&') || value.includes('|')) {
      return `"${value}"`;
    }
    return value;
  }

  saveOptions(appid: number) {
    if (this.#isSteam) {
      SteamClient.Apps.SetAppLaunchOptions(appid, this.getOptionsString());
      Backend.sendNotice(t("MESSAGE_SAVED", "Game launch options have been saved."));
    } else {
      Backend.sendNotice(t(
        "MESSAGE_NON_STEAM",
        "Warning: This is NOT a steam game! Settings will never be saved.",
      ));
    }
  }

  // New methods for future extension
  getParameters(): ParsedParam[] {
    return [...this.#parsedParams];
  }

  setParameter(param: ParsedParam): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.key !== param.key);
    this.#parsedParams.push({
      ...param,
      order: param.order ?? this.#parsedParams.filter(p => p.position === param.position).length
    });
  }

  removeParameter(key: string): void {
    this.#parsedParams = this.#parsedParams.filter(p => p.key !== key);
  }
}
