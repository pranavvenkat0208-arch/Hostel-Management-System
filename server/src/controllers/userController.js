const { User } = require('../models/User');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');

// Used by the Users page and the "assign to" pickers.
async function getUsers(req, res) {
  const { role } = req.query;

  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter).select('name email role phone isActive').sort({ name: 1 });
  const publicUsers = users.map((u) => u.toPublic());

  res.json({ success: true, count: publicUsers.length, users: publicUsers });
}

// Admins can't change their own role, so there's always an admin left to undo mistakes.
async function updateUserRole(req, res) {
  const { role } = req.body;

  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.role = role;
  await user.save();

  res.json({
    success: true,
    user: user.toPublic(),
  });
}

// Deactivated users keep their data but can't log in.
async function updateUserStatus(req, res) {
  const { isActive } = req.body;

  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    user: user.toPublic(),
  });
}

// Name isn't editable here. An email change is copied to the Resident profile too.
async function updateUserDetails(req, res) {
  const { email, phone } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const conflict = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (conflict) throw new ApiError(409, 'Another account already uses this email');

      user.email = normalizedEmail;
      await Resident.updateOne({ user: user._id }, { email: normalizedEmail });
    }
  }

  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    user: user.toPublic(),
  });
}

module.exports = { getUsers, updateUserRole, updateUserStatus, updateUserDetails };
