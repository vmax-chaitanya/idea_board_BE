const { sendError } = require("../utils/responseHandler");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(
    {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
    },
    "Unhandled error"
  );

  const statusCode = err.statusCode || 500;
  const error = err.error || "Internal Server Error";
  const message = err.message || "Something went wrong";

  return sendError(res, error, message, statusCode);
};

module.exports = errorHandler;
