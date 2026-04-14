const pino = require("pino");
const { nodeEnv } = require("../config/env");

const isServerless =
  Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const canUsePretty = () => {
  if (nodeEnv === "production" || isServerless) return false;
  try {
    require.resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
};

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(canUsePretty()
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, singleLine: true },
        },
      }
    : {}),
});

module.exports = logger;
