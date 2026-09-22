const { ApiError } = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// Single place that turns any thrown error (ApiError or otherwise) into a
// consistent JSON response. Express 5 auto-forwards rejected promises from
// async route handlers here, so controllers can just `throw` without a
// try/catch or wrapper on every route.
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }

  console.error('Unknown error:', err);
  return res.status(500).json({ success: false, message: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
