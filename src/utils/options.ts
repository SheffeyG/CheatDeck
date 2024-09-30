export class Options {
  #options: { [key: string]: string };
  #others: string;
  #isSteam: boolean = true;

  constructor(input: string) {
    this.#options = {};
    this.#isSteam = !(input.includes("heroicgameslauncher") || input.includes("Emulation"));

    const match = input.match(/(.*)%command%(.*)/);

    // Some shortcuts has no `%command%`
    if (!match) {
      this.#others = input;
      return;
    }

    const optionsPart = match[1].trim();
    this.#others = match[2].trim();
    // Split with only the real space, not escaped space
    const keyValuePairs = optionsPart.split(/(?<!\\) /g);
    for (const pair of keyValuePairs) {
      const [key, value] = pair.split(/=(.*)/s);
      if (key && value) {
        this.#options[key.trim()] = value.trim();
      }
    }
  }

  isSteam(): boolean {
    return this.#isSteam;
  }

  hasField(key: string): boolean {
    return key in this.#options;
  }

  hasFieldValue(key: string, value: string): boolean {
    return key in this.#options && this.#options[key] === value;
  }

  getFieldValue(key: string): string {
    if (key in this.#options) {
      // Unescape spaces to get real value
      return this.#options[key].replace(/^"(.*)"$/, "$1").replace(/\\ /g, " ");
    }
    return "";
  }

  setFieldValue(key: string, value: string): string {
    const oldValue = this.#options[key];
    // Escape the input's spaces in case proton cmd parse with them
    this.#options[key] = value.trim().replace(/ /g, "\\ ");
    return oldValue;
  }

  getOptionsString(): string {
    let optionsString = "";
    for (const key in this.#options) {
      if (this.#options[key]) {
        const value = this.#options[key];
        optionsString += `${key}=${value} `;
      }
    }
    if (optionsString) optionsString += "%command%";
    if (this.#others) optionsString += " " + this.#others;
    return optionsString.trim();
  }
}
