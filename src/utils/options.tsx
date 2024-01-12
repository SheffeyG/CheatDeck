class Options {
    private options: { [key: string]: string };

    constructor(input: string) {
        this.options = {};
        const keyValuePairs = input.split(/(?<!\\) /g);
        for (const pair of keyValuePairs) {
            const [key, value] = pair.split('=');
            if (key && value) {
                this.options[key.trim()] = value.trim();
            }
        }
    }

    hasOption(key: string): boolean {
        return key in this.options;
    }

    getOptionValue(key: string): string {
        if (key in this.options) {
            return this.options[key].replace(/\\ /g, ' ');
        }
        return '';
    }

    setOptionValue(key: string, value: string): string {
        const oldValue = this.options[key];
        this.options[key] = value.trim().replace(/ /g, '\\ ');
        return oldValue;
    }
    
    getOptionsString(): string {
        let optionsString = '';
        for (const key in this.options) {
            if (this.options.hasOwnProperty(key) && this.options[key]) {
                const value = this.options[key];
                optionsString += `${key}=${value} `;
            }
        }
        if (optionsString) optionsString += '%command%'
        return optionsString.trim();
    }
    
}

const inputString = "A= B= C=0 %command%";
const options = new Options(inputString);
options.setOptionValue('D', '\ ');
// const res = options.getOptionValue('C');
const res = options.getOptionsString();

console.log(res);
