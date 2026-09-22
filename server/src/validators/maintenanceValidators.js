const { z } = require('zod');

const createMaintenanceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Please describe the issue in a bit more detail'),
  category: z.enum(['plumbing', 'electrical', 'furniture', 'cleanliness', 'internet', 'other']).default('other'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

const assignSchema = z.object({
  assignedTo: z.string().min(1, 'assignedTo is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  note: z.string().optional(),
});

module.exports = { createMaintenanceSchema, assignSchema, updateStatusSchema };
