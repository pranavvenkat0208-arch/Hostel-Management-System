const Razorpay = require('razorpay');
const crypto = require('crypto');
const { env } = require('../config/env');

let client = null;

// Keys are optional, so the client is created lazily.
function getClient() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  if (!client) {
    client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  }
  return client;
}

function isConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

// Razorpay works in paise.
async function createOrder({ amountRupees, receipt, notes }) {
  const rzp = getClient();
  if (!rzp) throw new Error('Razorpay is not configured');
  return rzp.orders.create({
    amount: Math.round(amountRupees * 100),
    currency: 'INR',
    receipt,
    notes,
  });
}

async function fetchOrder(orderId) {
  const rzp = getClient();
  if (!rzp) throw new Error('Razorpay is not configured');
  return rzp.orders.fetch(orderId);
}

// Standard Checkout check: HMAC-SHA256 of "order_id|payment_id" with the key secret.
function verifySignature({ orderId, paymentId, signature }) {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // timingSafeEqual needs equal-length buffers.
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { isConfigured, createOrder, fetchOrder, verifySignature };
