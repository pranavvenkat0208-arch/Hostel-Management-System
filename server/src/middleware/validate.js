const { ApiError } = require('../utils/ApiError');

// Validates req.body with a Zod schema and replaces it with the parsed result.
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
