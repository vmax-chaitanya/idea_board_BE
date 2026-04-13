const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const rateLimiter = require("./middlewares/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
const swaggerSpec = require("./config/swagger");

const env = require("./config/env");

const app = express();

// Vercel sends X-Forwarded-For; express-rate-limit errors if trust proxy stays false
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter);
app.use(requestLogger);

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: { status: "ok" },
    message: "Service is healthy",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
