const { Router } = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect, requireRole('admin', 'staff'));
router.get('/', getUsers);

module.exports = router;
