const rateLimit = require("express-rate-limit");
const { rateLimitWindowMs, rateLimitMaxRequests } = require("../config/env");

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Rate limit exceeded, please try again later.",
  },
});

module.exports = limiter;
