const { Schema, model } = require('mongoose');

const lineItemSchema = new Schema(
  { description: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const paymentRecordSchema = new Schema(
  {
    status: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'overdue'], required: true },
    amount: { type: Number, min: 0 },
    method: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'other'] },
    note: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedAt: { type: Date, default: Date.now },
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
