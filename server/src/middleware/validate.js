const { ApiError } = require('../utils/ApiError');

// Validates req.body against a Zod schema, replaces req.body with the
// parsed (and defaulted/coerced) result, or forwards a 400 with a clear
// message if it fails.
function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join('; ');
      return next(new ApiError(400, message));
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validate };
