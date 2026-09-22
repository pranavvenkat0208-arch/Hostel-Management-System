// Invoice status is always derived from the amounts and due date, never set
// directly. Precedence: paid, overdue, partially_paid, unpaid.
function recalculateInvoiceStatus(invoice) {
  if (invoice.amountPaid >= invoice.totalAmount) {
    invoice.status = 'paid';
  } else if (new Date(invoice.dueDate) < new Date()) {
    invoice.status = 'overdue';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'partially_paid';
  } else {
    invoice.status = 'unpaid';
  }
  return invoice.status;
}

// Clamped at 0 in case an old record has amountPaid > totalAmount.
function getOutstanding(invoice) {
  return Math.max(0, invoice.totalAmount - invoice.amountPaid);
}

module.exports = { recalculateInvoiceStatus, getOutstanding };
