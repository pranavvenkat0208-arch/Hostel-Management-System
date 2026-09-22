const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['allocation', 'maintenance', 'invoice', 'system'], default: 'system' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    // Where the frontend bell should take the user when they click a
    // notification — a relative route like "/billing", not a full URL.
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Powers "my recent notifications, unread first" without a collection scan.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = model('Notification', notificationSchema);

module.exports = { Notification };
