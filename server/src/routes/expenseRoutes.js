const { Router } = require('express');
const { createExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
const { validate } = require('../middleware/validate');
const { createExpenseSchema } = require('../validators/expenseValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

// Staff can log expenses, only admins can delete them.
router.use(protect, requireRole('admin', 'staff'));
router.get('/', getExpenses);
router.post('/', validate(createExpenseSchema), createExpense);
router.delete('/:id', requireRole('admin'), deleteExpense);

module.exports = router;
