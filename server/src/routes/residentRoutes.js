const { Router } = require('express');
const {
  getResidents,
  getResident,
  updateResident,
  deleteResident,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/residentController');
const { validate } = require('../middleware/validate');
const { updateResidentSchema, updateMyProfileSchema } = require('../validators/residentValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect);

router.get('/me', requireRole('resident'), getMyProfile);
router.patch('/me', requireRole('resident'), validate(updateMyProfileSchema), updateMyProfile);

router.get('/', requireRole('admin', 'staff'), getResidents);
router.get('/:id', requireRole('admin', 'staff'), getResident);
router.patch('/:id', requireRole('admin', 'staff'), validate(updateResidentSchema), updateResident);
// Only admins can delete residents.
router.delete('/:id', requireRole('admin'), deleteResident);

module.exports = router;
