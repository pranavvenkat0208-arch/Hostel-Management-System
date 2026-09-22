const { Notification } = require('../models/Notification');
const { ApiError } = require('../utils/ApiError');

// Latest 50 is enough for the bell dropdown.
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
