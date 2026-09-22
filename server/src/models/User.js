const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { PHONE_REGEX, PHONE_MESSAGE } = require('../utils/phone');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'staff', 'resident'],
      default: 'resident',
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || PHONE_REGEX.test(value),
        message: PHONE_MESSAGE,
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Shape returned by the API: no password, `id` instead of `_id`.
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    isActive: this.isActive,
  };
};

const User = model('User', userSchema);

module.exports = { User };
