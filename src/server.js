const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");

const startServer = () => {
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
};

process.on("SIGINT", () => {
  logger.info("Server shutting down");
  process.exit(0);
});

startServer();
