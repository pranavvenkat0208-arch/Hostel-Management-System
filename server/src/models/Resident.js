const { Schema, model } = require('mongoose');
const { PHONE_REGEX, PHONE_MESSAGE } = require('../utils/phone');

const phoneField = {
  type: String,
  trim: true,
  validate: {
    validator: (value) => !value || PHONE_REGEX.test(value),
    message: PHONE_MESSAGE,
  },
};

const residentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: phoneField,
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: phoneField,
    },
    currentRoom: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    // Just a hint for staff when allocating a room.
    preferredRoomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory', null],
      default: null,
    },
    status: { type: String, enum: ['active', 'checked_out'], default: 'active' },
  },
  { timestamps: true }
);

const Resident = model('Resident', residentSchema);

module.exports = { Resident };
