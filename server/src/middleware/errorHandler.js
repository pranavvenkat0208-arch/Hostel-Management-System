const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// Map common library errors to proper 4xx responses.
function toApiError(err) {
  if (err instanceof ApiError) return err;

  // Bad ObjectId, e.g. /rooms/abc
  if (err.name === 'CastError') return new ApiError(400, `Invalid ${err.path}: ${err.value}`);

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    return new ApiError(400, message);
  }

  // Duplicate key (email, room number)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    return new ApiError(409, `That ${field} is already in use`);
  }

  // Body parser errors (bad JSON, payload too large)
  if (err.status >= 400 && err.status < 500) return new ApiError(err.status, err.message);

  return null;
}

// Express 5 forwards rejected promises here, so controllers can just throw.
function errorHandler(err, _req, res, _next) {
  const apiError = toApiError(err);
  if (apiError) {
    return res.status(apiError.statusCode).json({ success: false, message: apiError.message });
  }

  console.error(err);
  // Don't leak internals in production.
  const message = env.NODE_ENV === 'production' ? 'Something went wrong' : err?.message || 'Server error';
  return res.status(500).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
