const { z } = require('zod');

const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['single', 'double', 'triple', 'dormitory']),
  floor: z.coerce.number().min(0, 'Floor cannot be negative').max(12, 'Floor cannot be greater than 12').optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  monthlyRent: z.coerce.number().min(0, 'Rent cannot be negative'),
  amenities: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateRoomSchema = z.object({
  type: z.enum(['single', 'double', 'triple', 'dormitory']).optional(),
  floor: z.coerce.number().min(0, 'Floor cannot be negative').max(12, 'Floor cannot be greater than 12').optional(),
  capacity: z.coerce.number().min(1).optional(),
  monthlyRent: z.coerce.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  underMaintenance: z.boolean().optional(),
  notes: z.string().optional(),
});

module.exports = { createRoomSchema, updateRoomSchema };
