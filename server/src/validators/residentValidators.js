const { z } = require('zod');
const { optionalPhoneSchema } = require('./phoneSchema');

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relation: z.string().optional(),
  phone: optionalPhoneSchema,
});

const preferredRoomTypeSchema = z.enum(['single', 'double', 'triple', 'dormitory']).nullable();

// Staff can't change a resident's name.
const updateResidentSchema = z.object({
  email: z.string().email('Enter a valid email address').optional(),
  phone: optionalPhoneSchema,
  emergencyContact: emergencyContactSchema.optional(),
  preferredRoomType: preferredRoomTypeSchema.optional(),
});

const updateMyProfileSchema = z.object({
  phone: optionalPhoneSchema,
  emergencyContact: emergencyContactSchema.optional(),
  preferredRoomType: preferredRoomTypeSchema.optional(),
});

module.exports = { emergencyContactSchema, updateResidentSchema, updateMyProfileSchema };
