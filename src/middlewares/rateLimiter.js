const rateLimit = require("express-rate-limit");
const { rateLimitWindowMs, rateLimitMaxRequests } = require("../config/env");

const { ipKeyGenerator } = rateLimit;

const firstForwardedFor = (headerValue) => {
  if (typeof headerValue !== "string" || !headerValue.trim()) return "";
  return headerValue.split(",")[0].trim();
};

const addressFromForwardedHeader = (forwarded) => {
  if (typeof forwarded !== "string" || !forwarded.trim()) return "";
  const first = forwarded.split(",")[0];
  const parts = first.split(";").map((p) => p.trim());
  const forPart = parts.find((p) => p.toLowerCase().startsWith("for="));
  if (!forPart) return "";

  let value = forPart.slice(4).trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  if (value.startsWith("[") && value.includes("]")) {
    value = value.slice(1, value.indexOf("]"));
  }
  value = value.replace(/^::ffff:/i, "");
  const ipv4Port = /^([\d.]+):\d+$/.exec(value);
  if (ipv4Port) return ipv4Port[1];
  return value;
};

/**
 * Client address for rate limiting on Vercel / serverless-http, where `req.ip`
 * is often undefined even though proxy headers are present.
 */
const clientAddressForRateLimit = (req) => {
  const fromVercel = firstForwardedFor(req.headers["x-vercel-forwarded-for"]);
  if (fromVercel) return fromVercel;

  const fromXff = firstForwardedFor(req.headers["x-forwarded-for"]);
  if (fromXff) return fromXff;

  const fromForwarded = addressFromForwardedHeader(req.headers.forwarded);
  if (fromForwarded) return fromForwarded;

  return req.socket?.remoteAddress || "unknown";
};

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
  keyGenerator: (req) => {
    const addr = clientAddressForRateLimit(req);
    return ipKeyGenerator(addr, 56);
  },
});

module.exports = limiter;
