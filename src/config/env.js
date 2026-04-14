const dotenv = require("dotenv");

dotenv.config();

const parseCorsOrigins = () => {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === "") {
    return true;
  }
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length > 0 ? list : true;
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL?.trim() || "",
  /** Server-only: never expose in browser clients. */
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  aiProvider: process.env.AI_PROVIDER || "mock",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  corsOrigins: parseCorsOrigins(),
  /** Max time for each Supabase HTTP request (ms). */
  supabaseFetchTimeoutMs: (() => {
    const raw = process.env.SUPABASE_FETCH_TIMEOUT_MS;
    if (raw !== undefined && raw !== "" && !Number.isNaN(Number(raw))) {
      return Math.max(1000, Number(raw));
    }
    return 25000;
  })(),
};
