const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

prisma.$on("error", (event) => {
  logger.error({ event }, "Prisma error event");
});

module.exports = prisma;
