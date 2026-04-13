const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prisma.$on("error", (event) => {
  logger.error({ event }, "Prisma error event");
});

module.exports = prisma;
