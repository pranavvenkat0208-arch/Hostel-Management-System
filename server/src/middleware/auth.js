const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

// Verifies the Bearer token on the request and attaches { id, role } to
// req.user. Any route behind this can trust req.user is present.
function protect(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;

  if (!token) {
    return next(new ApiError(401, 'Not authenticated — no token provided'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    next(new ApiError(401, 'Not authenticated — invalid or expired token'));
  }
}

module.exports = { protect };
