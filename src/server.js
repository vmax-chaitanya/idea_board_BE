const app = require("./app");
const prisma = require("./config/prisma");
const env = require("./config/env");
const logger = require("./utils/logger");

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.info("Database disconnected");
  process.exit(0);
});

startServer();
