const { Schema, model } = require('mongoose');

const lineItemSchema = new Schema(
  { description: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const paymentRecordSchema = new Schema(
  {
    status: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'overdue'], required: true },
    amount: { type: Number, min: 0 },
    method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'razorpay', 'other'] },
    note: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Amounts are fixed when the plan is created; only the payment fields change later.
const installmentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'razorpay', 'other'] },
    note: { type: String },
    paidAt: { type: Date, default: null },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    resident: { type: Schema.Types.ObjectId, ref: 'Resident', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    billingPeriod: { type: String, required: true },
    lineItems: { type: [lineItemSchema], required: true, validate: (v) => v.length > 0 },
    discount: { type: Number, default: 0, min: 0 },
    lateFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'overdue'], default: 'unpaid' },
    dueDate: { type: Date, required: true },
    paymentHistory: { type: [paymentRecordSchema], default: [] },
    // Optional payment plan. Empty means the balance is paid in one go.
    installments: { type: [installmentSchema], default: [] },
    // Used by the reminder job so it doesn't remind twice in 24h.
    lastReminderAt: { type: Date, default: null },
    // Stops the automatic late fee from being added more than once.
    lateFeeApplied: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Keeps totalAmount in sync whenever the billable parts of the invoice change.
invoiceSchema.pre('save', function () {
  if (this.isModified('lineItems') || this.isModified('discount') || this.isModified('lateFee')) {
    const itemsTotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
    this.totalAmount = Math.max(0, itemsTotal - this.discount + this.lateFee);
  }
});

const Invoice = model('Invoice', invoiceSchema);

module.exports = { Invoice };
