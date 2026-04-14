const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

const createTimeoutFetch =
  (timeoutMs) =>
  (input, init = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const upstream = init.signal;
    let signal = controller.signal;
    if (upstream && typeof AbortSignal.any === "function") {
      signal = AbortSignal.any([upstream, controller.signal]);
    }

    return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
  };

const createAdminClient = () => {
  const url = env.supabaseUrl;
  const key = env.supabaseServiceRoleKey;
  if (!url || !key) {
    throw new Error(
      "Supabase: set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: createTimeoutFetch(env.supabaseFetchTimeoutMs),
    },
  });
};

const globalForSupabase = globalThis;

const supabase =
  globalForSupabase.__supabaseAdmin__ ?? createAdminClient();

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.__supabaseAdmin__ = supabase;
}

module.exports = supabase;
