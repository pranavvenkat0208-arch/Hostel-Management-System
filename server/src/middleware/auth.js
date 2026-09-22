const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');

// Checks the Bearer token, then reloads the user so deactivation and role
// changes apply right away instead of when the token expires.
async function protect(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;

  if (!token) {
    return next(new ApiError(401, 'Not authenticated: no token provided'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return next(new ApiError(401, 'Not authenticated: invalid or expired token'));
  }

  const user = await User.findById(decoded.id).select('role isActive').lean();
  if (!user || !user.isActive) {
    return next(new ApiError(401, 'Not authenticated: this account is no longer active'));
  }

  req.user = { id: String(user._id), role: user.role };
  next();
}

module.exports = { protect };
