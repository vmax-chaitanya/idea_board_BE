const pino = require("pino");
const { nodeEnv } = require("../config/env");

// pino-pretty uses a worker transport; it fails on Vercel/serverless ("unable to determine transport target")
const usePretty =
  nodeEnv === "development" && !process.env.VERCEL;

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
