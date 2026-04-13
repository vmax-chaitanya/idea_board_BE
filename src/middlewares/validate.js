const AppError = require("../utils/appError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    return next(new AppError(message, 400, "Validation Error"));
  }

  req.validated = result.data;
  return next();
};

module.exports = validate;
