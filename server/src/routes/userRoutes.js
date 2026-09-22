const { Router } = require('express');
const { getUsers, updateUserRole, updateUserStatus, updateUserDetails } = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const { updateUserRoleSchema, updateUserStatusSchema, updateUserDetailsSchema } = require('../validators/userValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect, requireRole('admin', 'staff'));
router.get('/', getUsers);

// Changes are admin only.
router.patch('/:id/role', requireRole('admin'), validate(updateUserRoleSchema), updateUserRole);
router.patch('/:id/status', requireRole('admin'), validate(updateUserStatusSchema), updateUserStatus);
router.patch('/:id/details', requireRole('admin'), validate(updateUserDetailsSchema), updateUserDetails);

module.exports = router;
