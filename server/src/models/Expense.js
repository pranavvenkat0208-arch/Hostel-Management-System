const { Schema, model } = require('mongoose');

const expenseSchema = new Schema(
  {
    category: {
      type: String,
      enum: ['electricity', 'water', 'staff_salaries', 'repairs_maintenance', 'supplies', 'other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Expense = model('Expense', expenseSchema);

module.exports = { Expense };
