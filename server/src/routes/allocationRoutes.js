const { Router } = require('express');
const { allocateRoom, checkOut, changeRoom, getAllocationHistory } = require('../controllers/allocationController');
const { validate } = require('../middleware/validate');
const { allocateRoomSchema, checkOutSchema, changeRoomSchema } = require('../validators/allocationValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect, requireRole('admin', 'staff'));

router.get('/', getAllocationHistory);
router.post('/allocate', validate(allocateRoomSchema), allocateRoom);
router.post('/check-out', validate(checkOutSchema), checkOut);
router.post('/change-room', validate(changeRoomSchema), changeRoom);

module.exports = router;
