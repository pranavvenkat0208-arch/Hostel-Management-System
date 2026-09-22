const { Router } = require('express');
const {
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
} = require('../controllers/invoiceController');
const { validate } = require('../middleware/validate');
const {
  createInvoiceSchema,
  updatePaymentStatusSchema,
  updateInvoiceAdjustmentsSchema,
  createInstallmentPlanSchema,
  payInstallmentSchema,
  verifyPaymentSchema,
} = require('../validators/invoiceValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect);

router.get('/my', requireRole('resident'), getMyInvoices);
router.get('/', requireRole('admin', 'staff'), getInvoices);
router.get('/:id', getInvoice); // permission checked inside the controller
router.post('/', requireRole('admin', 'staff'), validate(createInvoiceSchema), createInvoice);
router.patch(
  '/:id/payment-status',
  requireRole('admin', 'staff'),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);
// Editing the discount/late fee after creation.
router.patch(
  '/:id/adjustments',
  requireRole('admin', 'staff'),
  validate(updateInvoiceAdjustmentsSchema),
  updateInvoiceAdjustments
);

// Payment plans (staff)
router.post(
  '/:id/installments',
  requireRole('admin', 'staff'),
  validate(createInstallmentPlanSchema),
  createInstallmentPlan
);
router.patch(
  '/:id/installments/:index/pay',
  requireRole('admin', 'staff'),
  validate(payInstallmentSchema),
  payInstallmentManually
);

// Online payment by the resident (Razorpay)
router.post('/:id/pay/order', requireRole('resident'), createPaymentOrder);
router.post('/:id/pay/verify', requireRole('resident'), validate(verifyPaymentSchema), verifyPayment);

module.exports = router;
