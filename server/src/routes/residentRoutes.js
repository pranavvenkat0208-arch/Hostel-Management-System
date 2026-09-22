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
const { updateResidentSchema, emergencyContactSchema } = require('../validators/residentValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { z } = require('zod');

const router = Router();

router.use(protect);

router.get('/me', requireRole('resident'), getMyProfile);
router.patch(
  '/me',
  requireRole('resident'),
  validate(z.object({ phone: z.string().optional(), emergencyContact: emergencyContactSchema.optional() })),
  updateMyProfile
);

router.get('/', requireRole('admin', 'staff'), getResidents);
router.get('/:id', requireRole('admin', 'staff'), getResident);
router.patch('/:id', requireRole('admin', 'staff'), validate(updateResidentSchema), updateResident);
// Deleting an account is admin-only — staff can manage day-to-day room/
// maintenance/billing work but shouldn't be able to remove people.
router.delete('/:id', requireRole('admin'), deleteResident);

module.exports = router;
