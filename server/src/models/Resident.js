const { Schema, model } = require('mongoose');

const residentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    currentRoom: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    status: { type: String, enum: ['active', 'checked_out'], default: 'active' },
  },
  { timestamps: true }
);

const Resident = model('Resident', residentSchema);

module.exports = { Resident };
