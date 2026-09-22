const { Invoice } = require('../models/Invoice');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { notifyUser } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const { html } = require('../utils/html');
const { createOrder, fetchOrder, verifySignature, isConfigured } = require('../services/paymentService');
const { recalculateInvoiceStatus, getOutstanding } = require('../utils/invoiceStatus');
const { env } = require('../config/env');

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
    subject: `New invoice for ${billingPeriod}`,
    html: html`<p>Hi ${resident.name},</p><p>A new invoice of <b>₹${invoice.totalAmount}</b> for <b>${billingPeriod}</b> has been generated. It is due on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>`,
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

// Records a payment. The status sent by staff is only a hint; the stored status
// is always derived from the amounts.
async function updatePaymentStatus(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const { status, amount, method, note } = req.body;
  const outstanding = getOutstanding(invoice);

  // "Paid" with no amount means settle the remaining balance.
  let amountToRecord = amount;
  if (status === 'paid' && !amountToRecord) {
    amountToRecord = outstanding;
  }

  if (amountToRecord) {
    if (amountToRecord > outstanding + 0.01) {
      throw new ApiError(400, `That's more than the ₹${outstanding.toFixed(2)} still outstanding on this invoice`);
    }
    invoice.amountPaid += amountToRecord;
  }

  recalculateInvoiceStatus(invoice);

  invoice.paymentHistory.push({
    status: invoice.status,
    amount: amountToRecord,
    method,
    note,
    recordedBy: req.user.id,
    recordedAt: new Date(),
  });

  await invoice.save();

  const resident = await Resident.findById(invoice.resident);
  if (resident) {
    const readableStatus = invoice.status.replace('_', ' ');

    notifyUser({
      recipient: resident.user,
      type: 'invoice',
      title: 'Invoice payment status updated',
      message: `Your invoice for ${invoice.billingPeriod} is now marked ${readableStatus}.`,
      link: '/billing',
    });

    sendEmail({
      to: resident.email,
      subject: `Payment update for ${invoice.billingPeriod}`,
      html: html`<p>Hi ${resident.name},</p><p>Your invoice for <b>${invoice.billingPeriod}</b> has been updated to <b>${readableStatus}</b>.</p>${amountToRecord ? html`<p>Amount recorded: ₹${amountToRecord}</p>` : ''}`,
    });
  }

  res.json({ success: true, invoice });
}

// Edit discount/late fee after creation. Rejects changes that would push the
// total below what's already been paid.
async function updateInvoiceAdjustments(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const { discount, lateFee } = req.body;

  const itemsTotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const nextDiscount = discount ?? invoice.discount;
  const nextLateFee = lateFee ?? invoice.lateFee;
  const previewTotal = Math.max(0, itemsTotal - nextDiscount + nextLateFee);

  if (previewTotal < invoice.amountPaid - 0.01) {
    throw new ApiError(
      400,
      `That would bring the total below the ₹${invoice.amountPaid.toFixed(2)} already paid on this invoice`
    );
  }

  if (discount !== undefined) invoice.discount = discount;
  if (lateFee !== undefined) invoice.lateFee = lateFee;

  await invoice.save();
  recalculateInvoiceStatus(invoice);
  await invoice.save();

  res.json({ success: true, invoice });
}

// Payment plans

// Installments must add up to what's still outstanding, not the original total.
async function createInstallmentPlan(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.status === 'paid') throw new ApiError(400, 'This invoice is already fully paid');

  const { installments } = req.body;
  const outstanding = getOutstanding(invoice);
  const sum = installments.reduce((s, i) => s + i.amount, 0);

  if (Math.abs(sum - outstanding) > 0.01) {
    throw new ApiError(400, `Installment amounts must add up to the outstanding balance (₹${outstanding.toFixed(2)})`);
  }

  invoice.installments = installments.map((i) => ({
    amount: i.amount,
    dueDate: i.dueDate,
    status: 'pending',
  }));

  await invoice.save();
  res.json({ success: true, invoice });
}

// Manual (cash/UPI/etc.) payment of one installment, recorded by staff.
async function payInstallmentManually(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const index = Number(req.params.index);
  const installment = invoice.installments[index];
  if (!installment) throw new ApiError(404, 'Installment not found');
  if (installment.status === 'paid') throw new ApiError(400, 'This installment is already paid');

  const { method, note } = req.body;

  installment.status = 'paid';
  installment.paidAt = new Date();
  installment.method = method;
  installment.note = note;

  invoice.amountPaid += installment.amount;
  recalculateInvoiceStatus(invoice);
  invoice.paymentHistory.push({
    status: invoice.status,
    amount: installment.amount,
    method,
    note: note || `Installment ${index + 1} payment`,
    recordedBy: req.user.id,
    recordedAt: new Date(),
  });

  await invoice.save();

  const resident = await Resident.findById(invoice.resident);
  if (resident) {
    notifyUser({
      recipient: resident.user,
      type: 'invoice',
      title: 'Installment payment recorded',
      message: `₹${installment.amount} recorded for ${invoice.billingPeriod}.`,
      link: '/billing',
    });
  }

  res.json({ success: true, invoice });
}

// Online payments (Razorpay)

function findNextPendingInstallmentIndex(invoice) {
  let bestIndex = -1;
  let bestDue = null;
  invoice.installments.forEach((inst, index) => {
    if (inst.status !== 'pending') return;
    if (bestDue === null || new Date(inst.dueDate) < bestDue) {
      bestDue = new Date(inst.dueDate);
      bestIndex = index;
    }
  });
  return bestIndex;
}

// The order covers the next pending installment, or the full balance if there's
// no plan. The installment index goes in the order notes so verifyPayment
// doesn't have to trust the client.
async function createPaymentOrder(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident || !invoice.resident.equals(resident._id)) {
    throw new ApiError(403, 'You do not have permission to pay this invoice');
  }

  if (invoice.status === 'paid') throw new ApiError(400, 'This invoice is already fully paid');

  const installmentIndex = findNextPendingInstallmentIndex(invoice);
  const amountRupees =
    installmentIndex >= 0 ? invoice.installments[installmentIndex].amount : getOutstanding(invoice);

  if (amountRupees <= 0) throw new ApiError(400, 'Nothing outstanding on this invoice');

  if (!isConfigured()) {
    throw new ApiError(503, 'Online payments are not set up yet. Please contact the hostel office.');
  }

  let order;
  try {
    order = await createOrder({
      amountRupees,
      receipt: `inv_${invoice._id}_${Date.now()}`,
      notes: { invoiceId: String(invoice._id), installmentIndex: String(installmentIndex) },
    });
  } catch (error) {
    console.error('[payments] Failed to create Razorpay order:', error);
    throw new ApiError(502, 'Could not start the payment. Please try again.');
  }

  res.json({
    success: true,
    order: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID },
  });
}

// Verify the Checkout callback signature before recording the payment.
async function verifyPayment(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident || !invoice.resident.equals(resident._id)) {
    throw new ApiError(403, 'You do not have permission to pay this invoice');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Ignore a duplicate callback for a payment that's already recorded.
  const alreadyRecorded = invoice.paymentHistory.some((p) => p.note && p.note.includes(razorpay_payment_id));
  if (alreadyRecorded) {
    return res.json({ success: true, invoice, message: 'Payment already recorded' });
  }

  const isValid = verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!isValid) throw new ApiError(400, 'Payment verification failed (signature mismatch)');

  let order;
  try {
    order = await fetchOrder(razorpay_order_id);
  } catch (error) {
    console.error('[payments] Failed to fetch Razorpay order:', error);
    throw new ApiError(502, 'Could not confirm the payment with Razorpay. Please contact the hostel office.');
  }

  const installmentIndex = Number(order.notes?.installmentIndex ?? -1);
  const amountRupees = order.amount / 100;

  if (installmentIndex >= 0 && invoice.installments[installmentIndex]?.status === 'pending') {
    const installment = invoice.installments[installmentIndex];
    installment.status = 'paid';
    installment.paidAt = new Date();
    installment.method = 'razorpay';
    installment.note = `Razorpay payment ${razorpay_payment_id}`;
  }

  invoice.amountPaid += amountRupees;
  recalculateInvoiceStatus(invoice);
  invoice.paymentHistory.push({
    status: invoice.status,
    amount: amountRupees,
    method: 'razorpay',
    note: `Razorpay payment ${razorpay_payment_id}`,
    recordedBy: req.user.id,
    recordedAt: new Date(),
  });

  await invoice.save();

  notifyUser({
    recipient: resident.user,
    type: 'invoice',
    title: 'Payment received',
    message: `₹${amountRupees} received for ${invoice.billingPeriod}. Thank you!`,
    link: '/billing',
  });

  sendEmail({
    to: resident.email,
    subject: `Payment received for ${invoice.billingPeriod}`,
    html: html`<p>Hi ${resident.name},</p><p>We've received your payment of <b>₹${amountRupees}</b> for <b>${invoice.billingPeriod}</b> via Razorpay.</p>`,
  });

  res.json({ success: true, invoice });
}

module.exports = {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoice,
  updatePaymentStatus,
  updateInvoiceAdjustments,
  createInstallmentPlan,
  payInstallmentManually,
  createPaymentOrder,
  verifyPayment,
};
