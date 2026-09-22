const { z } = require('zod');

const createExpenseSchema = z.object({
  category: z.enum(['electricity', 'water', 'staff_salaries', 'repairs_maintenance', 'supplies', 'other']),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  date: z.coerce.date().optional(),
  description: z.string().optional(),
});

module.exports = { createExpenseSchema };
