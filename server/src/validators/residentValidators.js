const { z } = require('zod');

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relation: z.string().optional(),
  phone: z.string().optional(),
});

const updateResidentSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
});

module.exports = { emergencyContactSchema, updateResidentSchema };
