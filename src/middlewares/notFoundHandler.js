const { sendError } = require("../utils/responseHandler");

const notFoundHandler = (req, res) => {
  return sendError(res, "Not Found", `Route ${req.originalUrl} not found`, 404);
};

module.exports = notFoundHandler;
