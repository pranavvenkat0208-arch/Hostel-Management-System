const { Expense } = require('../models/Expense');
const { ApiError } = require('../utils/ApiError');

async function createExpense(req, res) {
  const { category, amount, date, description } = req.body;

  const expense = await Expense.create({
    category,
    amount,
    date: date ?? new Date(),
    description,
    recordedBy: req.user.id,
  });

  res.status(201).json({ success: true, expense });
}

async function getExpenses(req, res) {
  const { category } = req.query;

  const filter = {};
  if (category) filter.category = category;

  const expenses = await Expense.find(filter).populate('recordedBy', 'name').sort({ date: -1 });
  res.json({ success: true, count: expenses.length, expenses });
}

async function deleteExpense(req, res) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  await expense.deleteOne();
  res.json({ success: true, message: 'Expense deleted' });
}

module.exports = { createExpense, getExpenses, deleteExpense };
