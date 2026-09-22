const { Notification } = require('../models/Notification');
const { User } = require('../models/User');

// Like sendEmail, errors are logged and never thrown.
async function notifyUser({ recipient, type, title, message, link }) {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (error) {
    console.error('[notifications] Failed to create notification:', error);
  }
}

// Notify every active user with the given role(s).
async function notifyRole(role, { type, title, message, link }) {
  try {
    const roles = Array.isArray(role) ? role : [role];
    const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id');
    if (users.length === 0) return;

    await Notification.insertMany(users.map((u) => ({ recipient: u._id, type, title, message, link })));
  } catch (error) {
    console.error('[notifications] Failed to notify role:', error);
  }
}

module.exports = { notifyUser, notifyRole };
