const { Notification } = require('../models/Notification');
const { ApiError } = require('../utils/ApiError');

// Most recent 50 is plenty for an in-app bell — this isn't meant to be a
// full audit log, just "what happened recently that I should know about."
async function getMyNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

  res.json({ success: true, notifications, unreadCount });
}

async function markAsRead(req, res) {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
  if (!notification) throw new ApiError(404, 'Notification not found');

  notification.read = true;
  await notification.save();

  res.json({ success: true, notification });
}

async function markAllAsRead(req, res) {
  await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
  res.json({ success: true, message: 'All notifications marked as read' });
}

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
