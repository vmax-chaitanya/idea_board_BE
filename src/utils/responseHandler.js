const sendSuccess = (res, data, message = "Request successful", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, error = "Internal Server Error", message = "Request failed", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};

module.exports = { sendSuccess, sendError };
