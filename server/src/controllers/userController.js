const { User } = require('../models/User');

// Lightweight user listing used for admin/staff pickers (e.g. "assign to"
// dropdowns on maintenance requests). Never exposes password hashes.
async function getUsers(req, res) {
  const { role } = req.query;

  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter).select('name email role phone isActive').sort({ name: 1 });

  // Reshaped to `id` (not Mongo's `_id`) to match the same public-user
  // shape /auth endpoints return, so the frontend has one consistent User type.
  const publicUsers = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    isActive: u.isActive,
  }));

  res.json({ success: true, count: publicUsers.length, users: publicUsers });
}

module.exports = { getUsers };
