export class Options {
  private options: { [key: string]: string };
  private others: string;

  constructor(input: string) {
    this.options = {};
    const match = input.match(/(.*)%command%(.*)/);
    // no normal options
    if (!match) { this.others = input; return }

    const optionsPart = match[1].trim();
    this.others = match[2].trim();
    const keyValuePairs = optionsPart.split(/(?<!\\) /g); // only when real space
    for (const pair of keyValuePairs) {
      const [key, value] = pair.split(/=(.*)/s);
      if (key && value) {
        this.options[key.trim()] = value.trim();
      }
    }
  }

  hasField(key: string): boolean {
    return key in this.options;
  }

  hasFieldValue(key: string, value: string): boolean {
    return key in this.options && this.options[key] === value;
  }

  getFieldValue(key: string): string {
    if (key in this.options) {
      return this.options[key].replace(/^"(.*)"$/, '\$1').replace(/\\ /g, ' ');
    }
    return '';
  }

  setFieldValue(key: string, value: string): string {
    const oldValue = this.options[key];
    this.options[key] = value.trim().replace(/ /g, '\\ '); // escape the space
    return oldValue;
  }

  getOptionsString(): string {
    let optionsString = '';
    for (const key in this.options) {
      if (this.options[key]) {
        const value = this.options[key];
        optionsString += `${key}=${value} `;
      }
    }
    if (optionsString) optionsString += '%command%';
    if (this.others) optionsString += ' ' + this.others;
    return optionsString.trim();
  }

}
