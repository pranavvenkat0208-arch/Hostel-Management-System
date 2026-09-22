const { Notification } = require('../models/Notification');
const { User } = require('../models/User');

// Same philosophy as emailService's sendEmail: creating a notification is a
// side effect of some other action (checking a resident in, updating an
// invoice), so a failure here should never break that action's response.
async function notifyUser({ recipient, type, title, message, link }) {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (error) {
    console.error('[notifications] Failed to create notification:', error);
  }
}

// Notifies every active user in one role (or set of roles) — used for
// events staff/admins care about but no single resident triggered, like a
// new maintenance request landing in the queue.
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
