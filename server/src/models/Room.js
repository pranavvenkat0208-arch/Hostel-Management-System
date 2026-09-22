const { Schema, model } = require('mongoose');

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'];

const roomSchema = new Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ROOM_TYPES, required: true },
    floor: { type: Number, max: 12 },
    capacity: { type: Number, required: true, min: 1 },
    occupied: { type: Number, default: 0, min: 0 },
    monthlyRent: { type: Number, required: true, min: 0 },
    amenities: { type: [String], default: [] },
    underMaintenance: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

const Room = model('Room', roomSchema);

module.exports = { Room, ROOM_TYPES };
