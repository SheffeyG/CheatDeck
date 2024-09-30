export const log = (...args: unknown[]) => {
  console.log(
    `%c CheatDeck %c`,
    "background: #16a085; color: black;",
    "background: #1abc9c; color: black;",
    ...args,
  );
};

export const debug = (...args: unknown[]) => {
  console.debug(
    `%c CheatDeck %c`,
    "background: #16a085; color: black;",
    "background: #1abc9c; color: black;",
    ...args,
  );
};

export const error = (...args: unknown[]) => {
  console.error(
    `%c CheatDeck %c`,
    "background: #16a085; color: black;",
    "background: #FF0000;",
    ...args,
  );
};

const logger = {
  info: (...args: unknown[]) => {
    log(...args);
  },

  debug: (...args: unknown[]) => {
    debug(...args);
  },

  error: (...args: unknown[]) => {
    error(...args);
  },
};

export default logger;
