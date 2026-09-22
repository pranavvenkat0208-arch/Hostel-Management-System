const { ApiError } = require('../utils/ApiError');

// Usage: router.get('/admin-only', protect, requireRole('admin'), handler)
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
}

module.exports = { requireRole };
