const { Router } = require('express');
const {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  getOccupancySummary,
} = require('../controllers/roomController');
const { validate } = require('../middleware/validate');
const { createRoomSchema, updateRoomSchema } = require('../validators/roomValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect);

router.get('/', requireRole('admin', 'staff'), getRooms);
router.get('/occupancy-summary', requireRole('admin', 'staff'), getOccupancySummary);
router.get('/:id', requireRole('admin', 'staff'), getRoom);
router.post('/', requireRole('admin'), validate(createRoomSchema), createRoom);
router.patch('/:id', requireRole('admin'), validate(updateRoomSchema), updateRoom);
router.delete('/:id', requireRole('admin'), deleteRoom);

module.exports = router;
