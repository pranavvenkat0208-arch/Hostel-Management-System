const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['allocation', 'maintenance', 'invoice', 'system', 'room'], default: 'system' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    // Client route to open on click, e.g. /billing
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// For each user's recent/unread list.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = model('Notification', notificationSchema);

module.exports = { Notification };
