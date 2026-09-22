const { Invoice } = require('../models/Invoice');
const { notifyUser } = require('./notificationService');
const { sendEmail } = require('./emailService');
const { html } = require('../utils/html');
const { recalculateInvoiceStatus, getOutstanding } = require('../utils/invoiceStatus');
const { env } = require('../config/env');

// Remind from 3 days before the due date and keep reminding once overdue,
// at most once every 24h per invoice.
const REMINDER_WINDOW_DAYS = 3;
const MIN_HOURS_BETWEEN_REMINDERS = 24;

async function runBillingReminders() {
  const now = new Date();
  const soon = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await Invoice.find({
    status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    dueDate: { $lte: soon },
  }).populate('resident', 'name email user');

  let sent = 0;

  for (const invoice of candidates) {
    const resident = invoice.resident;
    if (!resident) continue;

    if (invoice.lastReminderAt) {
      const hoursSinceLast = (now - invoice.lastReminderAt) / (1000 * 60 * 60);
      if (hoursSinceLast < MIN_HOURS_BETWEEN_REMINDERS) continue;
    }

    // Stored status may be stale, so recalculate first.
    recalculateInvoiceStatus(invoice);
    if (invoice.status === 'paid') {
      await invoice.save();
      continue;
    }

    const isOverdue = invoice.status === 'overdue';
    invoice.lastReminderAt = now;

    // Automatic late fee, added once (only if LATE_FEE_AMOUNT is set).
    let lateFeeJustApplied = false;
    if (isOverdue && env.LATE_FEE_AMOUNT > 0 && !invoice.lateFeeApplied) {
      invoice.lateFee += env.LATE_FEE_AMOUNT;
      invoice.lateFeeApplied = true;
      lateFeeJustApplied = true;
    }

    await invoice.save(); // pre-save hook recalculates totalAmount if lateFee changed
    if (lateFeeJustApplied) {
      recalculateInvoiceStatus(invoice);
      await invoice.save();
    }

    const outstanding = getOutstanding(invoice);
    const dueLabel = isOverdue
      ? `was due ${new Date(invoice.dueDate).toLocaleDateString()} and is now overdue`
      : `is due ${new Date(invoice.dueDate).toLocaleDateString()}`;
    const lateFeeLabel = lateFeeJustApplied ? ` A late fee of ₹${env.LATE_FEE_AMOUNT} has been added.` : '';

    notifyUser({
      recipient: resident.user,
      type: 'invoice',
      title: isOverdue ? 'Invoice overdue' : 'Payment reminder',
      message: `Your invoice for ${invoice.billingPeriod} (₹${outstanding} outstanding) ${dueLabel}.${lateFeeLabel}`,
      link: '/billing',
    });

    sendEmail({
      to: resident.email,
      subject: isOverdue ? `Invoice overdue: ${invoice.billingPeriod}` : `Payment reminder: ${invoice.billingPeriod}`,
      html: html`<p>Hi ${resident.name},</p><p>Your invoice for <b>${invoice.billingPeriod}</b> (₹${outstanding} outstanding) ${dueLabel}.${lateFeeLabel}</p><p>You can pay online from the Billing page.</p>`,
    });

    sent += 1;
  }

  if (sent > 0) console.log(`[reminders] Sent ${sent} billing reminder(s)`);
  return sent;
}

module.exports = { runBillingReminders };
