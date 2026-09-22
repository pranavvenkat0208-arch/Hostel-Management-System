// npm run repair-invoices
//
// Fixes old invoices whose status and amountPaid don't match: caps overpayments
// and recalculates the status. Safe to run more than once.
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { Invoice } = require('../src/models/Invoice');
const { recalculateInvoiceStatus } = require('../src/utils/invoiceStatus');

async function repairInvoices() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB, checking invoice statuses...\n');

  const invoices = await Invoice.find({});
  let fixed = 0;

  for (const invoice of invoices) {
    const before = invoice.status;
    let changed = false;

    // Overpaid records inflate "Total collected" on Reports, so cap them.
    if (invoice.amountPaid > invoice.totalAmount) {
      const overpaidBy = invoice.amountPaid - invoice.totalAmount;
      console.log(
        `Capping ${invoice._id} (${invoice.billingPeriod}): amountPaid ₹${invoice.amountPaid} > ` +
          `totalAmount ₹${invoice.totalAmount} (overpaid by ₹${overpaidBy}), capping to ₹${invoice.totalAmount}`
      );
      invoice.amountPaid = invoice.totalAmount;
      changed = true;
    }

    recalculateInvoiceStatus(invoice);
    if (invoice.status !== before) changed = true;

    if (changed) {
      await invoice.save();
      console.log(
        `Fixed ${invoice._id} (${invoice.billingPeriod}): ${before} -> ${invoice.status} ` +
          `(paid ₹${invoice.amountPaid} of ₹${invoice.totalAmount})`
      );
      fixed += 1;
    }
  }

  console.log(`\nChecked ${invoices.length} invoice(s), fixed ${fixed}.`);
  await mongoose.disconnect();
  process.exit(0);
}

repairInvoices().catch((error) => {
  console.error('Repair failed:', error);
  process.exit(1);
});
