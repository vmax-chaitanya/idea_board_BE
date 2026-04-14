const express = require("express");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const requestLogger = require("./middlewares/requestLogger");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
const swaggerSpec = require("./config/swagger");
const env = require("./config/env");

const app = express();

// Vercel terminates TLS and forwards requests; trust proxy headers for req.ip, etc.
app.set("trust proxy", true);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const { allowedOrigins } = env;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: "1mb" }));
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
