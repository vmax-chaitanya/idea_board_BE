const pino = require("pino");
const { nodeEnv } = require("../config/env");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, singleLine: true },
        }
      : undefined,
});

module.exports = logger;
