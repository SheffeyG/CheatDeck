const log = (level: string, background: string, ...args: unknown[]) => {
  console.log(
    `%c CheatDeck %c ${level} `,
    "background: #16a085; color: black;",
    `background: ${background}; color: black;`,
    ...args,
  );
};

export const logger = {
  debug: (...args: unknown[]) => {
    log("DEBUG", "#1a96bc", ...args);
  },

  info: (...args: unknown[]) => {
    log("INFO", "#1abc9c", ...args);
  },

  warning: (...args: unknown[]) => {
    log("WARNING", "#ffbb00", ...args);
  },

  error: (...args: unknown[]) => {
    log("ERROR", "#bb0000", ...args);
  },
};
