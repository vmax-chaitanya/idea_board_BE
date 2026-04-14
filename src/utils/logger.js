const pino = require("pino");
const { nodeEnv } = require("../config/env");

const usePretty = nodeEnv === "development";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(usePretty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, singleLine: true },
        },
      }
    : {}),
});

module.exports = logger;
