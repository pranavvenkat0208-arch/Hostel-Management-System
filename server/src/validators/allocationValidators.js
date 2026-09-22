const { z } = require('zod');

const allocateRoomSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  roomId: z.string().min(1, 'roomId is required'),
  checkInDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const changeRoomSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  newRoomId: z.string().min(1, 'newRoomId is required'),
  notes: z.string().optional(),
});

const checkOutSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  notes: z.string().optional(),
});

module.exports = { allocateRoomSchema, changeRoomSchema, checkOutSchema };
