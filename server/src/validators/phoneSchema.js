const { z } = require('zod');
const { PHONE_REGEX, PHONE_MESSAGE } = require('../utils/phone');

// Phone is optional, but must be valid when given.
const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || PHONE_REGEX.test(value), { message: PHONE_MESSAGE });

module.exports = { optionalPhoneSchema };
