class AppError extends Error {
  constructor(message, statusCode = 500, error = "Internal Server Error") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

module.exports = AppError;
