const { Router } = require('express');
const {
  createInvoice,
  getInvoices,
  getMyInvoices,
  getInvoice,
  updatePaymentStatus,
} = require('../controllers/invoiceController');
const { validate } = require('../middleware/validate');
const { createInvoiceSchema, updatePaymentStatusSchema } = require('../validators/invoiceValidators');
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

module.exports = router;
