const { z } = require('zod');
const { optionalPhoneSchema } = require('./phoneSchema');

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'staff', 'resident']),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// Name isn't editable here, only contact details.
const updateUserDetailsSchema = z.object({
  email: z.string().email('Enter a valid email address').optional(),
  phone: optionalPhoneSchema,
});

module.exports = { updateUserRoleSchema, updateUserStatusSchema, updateUserDetailsSchema };
