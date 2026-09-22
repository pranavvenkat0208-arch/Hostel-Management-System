const { Schema, model } = require('mongoose');

const statusEventSchema = new Schema(
  {
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], required: true },
    note: { type: String },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const maintenanceRequestSchema = new Schema(
  {
    resident: { type: Schema.Types.ObjectId, ref: 'Resident', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'furniture', 'cleanliness', 'internet', 'other'],
      default: 'other',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    statusHistory: { type: [statusEventSchema], default: [] },
  },
  { timestamps: true }
);

const MaintenanceRequest = model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = { MaintenanceRequest };
