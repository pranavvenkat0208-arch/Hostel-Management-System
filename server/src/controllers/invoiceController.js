const { Invoice } = require('../models/Invoice');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { notifyUser } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

async function createInvoice(req, res) {
  const { residentId, billingPeriod, lineItems, discount, lateFee, dueDate } = req.body;

  const resident = await Resident.findById(residentId);
  if (!resident) throw new ApiError(404, 'Resident not found');

  const invoice = await Invoice.create({
    resident: resident._id,
    room: resident.currentRoom,
    billingPeriod,
    lineItems,
    discount: discount ?? 0,
    lateFee: lateFee ?? 0,
    dueDate,
    status: 'unpaid',
    createdBy: req.user.id,
  });

  notifyUser({
    recipient: resident.user,
    type: 'invoice',
    title: 'New invoice',
    message: `A new invoice of ₹${invoice.totalAmount} for ${billingPeriod} is due ${new Date(invoice.dueDate).toLocaleDateString()}.`,
    link: '/billing',
  });

  sendEmail({
    to: resident.email,
    subject: `New Invoice — ${billingPeriod}`,
    html: `<p>Hi ${resident.name},</p><p>A new invoice of <b>₹${invoice.totalAmount}</b> for <b>${billingPeriod}</b> has been generated. It is due on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>`,
  });

  res.status(201).json({ success: true, invoice });
}

async function getInvoices(req, res) {
  const { status, residentId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (residentId) filter.resident = residentId;

  const invoices = await Invoice.find(filter)
    .populate('resident', 'name email')
    .populate('room', 'roomNumber')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: invoices.length, invoices });
}

async function getMyInvoices(req, res) {
  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident) throw new ApiError(404, 'Resident profile not found');

  const invoices = await Invoice.find({ resident: resident._id })
    .populate('room', 'roomNumber')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: invoices.length, invoices });
}

async function getInvoice(req, res) {
  const base = await Invoice.findById(req.params.id);
  if (!base) throw new ApiError(404, 'Invoice not found');

  if (req.user.role === 'resident') {
    const resident = await Resident.findOne({ user: req.user.id });
    if (!resident || !base.resident.equals(resident._id)) {
      throw new ApiError(403, 'You do not have permission to view this invoice');
    }
  }

  const invoice = await Invoice.findById(req.params.id)
    .populate('resident', 'name email')
    .populate('room', 'roomNumber');

  res.json({ success: true, invoice });
}

// The single "mark as paid / partially paid / overdue" action. Every call
// logs a payment history entry (status + method + note), which is what
// gives residents and staff a paper trail without needing a separate
// "record a payment" flow.
async function updatePaymentStatus(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const { status, amount, method, note } = req.body;

  invoice.status = status;
  if (amount) invoice.amountPaid += amount;

  invoice.paymentHistory.push({
    status,
    amount,
    method,
    note,
    recordedBy: req.user.id,
    recordedAt: new Date(),
  });

  await invoice.save();

  const resident = await Resident.findById(invoice.resident);
  if (resident) {
    const readableStatus = status.replace('_', ' ');

    notifyUser({
      recipient: resident.user,
      type: 'invoice',
      title: 'Invoice payment status updated',
      message: `Your invoice for ${invoice.billingPeriod} is now marked ${readableStatus}.`,
      link: '/billing',
    });

    sendEmail({
      to: resident.email,
      subject: `Payment Update — ${invoice.billingPeriod}`,
      html: `<p>Hi ${resident.name},</p><p>Your invoice for <b>${invoice.billingPeriod}</b> has been updated to <b>${readableStatus}</b>.</p>${amount ? `<p>Amount recorded: ₹${amount}</p>` : ''}`,
    });
  }

  res.json({ success: true, invoice });
}

module.exports = { createInvoice, getInvoices, getMyInvoices, getInvoice, updatePaymentStatus };
