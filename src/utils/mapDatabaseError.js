const AppError = require("./appError");

/**
 * Turn Supabase / PostgREST / network failures into {@link AppError} for consistent JSON.
 */
const mapDatabaseError = (err) => {
  if (!err) return null;
  if (err instanceof AppError) return err;

  const code = err.code;
  const name = err.name;
  const msg = typeof err.message === "string" ? err.message : String(err);
  const isProd = process.env.NODE_ENV === "production";

  if (
    name === "AbortError" ||
    msg.includes("aborted") ||
    msg.includes("The operation was aborted")
  ) {
    return new AppError(
      "The database did not respond in time. Check that SUPABASE_URL and keys are set on Vercel, Supabase is reachable, and try again. If you are on Vercel Hobby, keep requests under ~10s.",
      504,
      "Gateway Timeout"
    );
  }

  if (code === "23505") {
    return new AppError(
      "This action conflicts with existing data (for example, a duplicate like).",
      409,
      "Conflict"
    );
  }

  if (code === "23503") {
    return new AppError("Referenced record does not exist.", 404, "Not Found");
  }

  if (code === "23502" || msg.includes("violates not-null constraint")) {
    return new AppError(
      isProd
        ? "Invalid data was rejected by the database."
        : msg,
      400,
      "Bad Request"
    );
  }

  if (code === "PGRST116") {
    return new AppError("Resource not found.", 404, "Not Found");
  }

  if (typeof code === "string" && code.startsWith("PGRST")) {
    return new AppError(
      isProd ? "The database could not run this query." : msg,
      400,
      "Bad Request"
    );
  }

  if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT") {
    return new AppError(
      "Could not reach the database. Verify SUPABASE_URL and network access.",
      503,
      "Service Unavailable"
    );
  }

  return null;
};

const toAppError = (err) => {
  const mapped = mapDatabaseError(err);
  if (mapped) return mapped;

  const msg = typeof err?.message === "string" ? err.message : "Something went wrong";
  return new AppError(
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : msg,
    500,
    "Internal Server Error"
  );
};

module.exports = { mapDatabaseError, toAppError };
