const { User } = require('../models/User');
const { Resident } = require('../models/Resident');
const { generateToken } = require('../utils/generateToken');
const { ApiError } = require('../utils/ApiError');
const { sendEmail } = require('../services/emailService');
const { html } = require('../utils/html');

async function register(req, res) {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  // Public sign-up always creates a resident; admins grant other roles.
  const user = await User.create({ name, email, password, phone, role: 'resident' });

  // Allocations, invoices and maintenance requests hang off the Resident profile.
  await Resident.create({ user: user._id, name: user.name, email: user.email, phone: user.phone });

  const token = generateToken(user._id.toString(), user.role);

  sendEmail({
    to: user.email,
    subject: 'Welcome to Hostel Management',
    html: html`<p>Hi ${user.name},</p><p>Your account has been created successfully as a <b>${user.role}</b>.</p>`,
  });

  res.status(201).json({ success: true, token, user: user.toPublic() });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const token = generateToken(user._id.toString(), user.role);

  res.json({ success: true, token, user: user.toPublic() });
}

async function getMe(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user: user.toPublic() });
}

module.exports = { register, login, getMe };
