const dotenv = require("dotenv");

dotenv.config();

const parseAllowedOrigins = () => {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
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
  allowedOrigins: parseAllowedOrigins(),
  /** Max time for each Supabase HTTP request (ms). */
  supabaseFetchTimeoutMs: (() => {
    const raw = process.env.SUPABASE_FETCH_TIMEOUT_MS;
    if (raw !== undefined && raw !== "" && !Number.isNaN(Number(raw))) {
      return Math.max(1000, Number(raw));
    }
    return 25000;
  })(),
};
