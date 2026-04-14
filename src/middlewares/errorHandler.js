const AppError = require("../utils/appError");
const { sendError } = require("../utils/responseHandler");
const logger = require("../utils/logger");
const { toAppError } = require("../utils/mapDatabaseError");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const appErr = err instanceof AppError ? err : toAppError(err);

  logger.error(
    {
      path: req.path,
      method: req.method,
      statusCode: appErr.statusCode,
      error: appErr.message,
      cause: err?.message,
      code: err?.code,
      stack: err?.stack,
    },
    "Request error"
  );

  return sendError(res, appErr.error, appErr.message, appErr.statusCode);
};

module.exports = errorHandler;
