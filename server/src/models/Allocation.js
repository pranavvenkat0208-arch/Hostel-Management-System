const { Schema, model } = require('mongoose');

const allocationSchema = new Schema(
  {
    resident: { type: Schema.Types.ObjectId, ref: 'Resident', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true, default: Date.now },
    checkOutDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'checked_out'], default: 'active' },
    allocatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

allocationSchema.index({ resident: 1, status: 1 });
allocationSchema.index({ room: 1, status: 1 });

const Allocation = model('Allocation', allocationSchema);

module.exports = { Allocation };
