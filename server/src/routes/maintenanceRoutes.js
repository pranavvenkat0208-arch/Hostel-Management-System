const { Router } = require('express');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequest,
  assignRequest,
  updateStatus,
} = require('../controllers/maintenanceController');
const { validate } = require('../middleware/validate');
const { createMaintenanceSchema, assignSchema, updateStatusSchema } = require('../validators/maintenanceValidators');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect);

router.post('/', requireRole('resident'), validate(createMaintenanceSchema), createRequest);
router.get('/my', requireRole('resident'), getMyRequests);
router.get('/', requireRole('admin', 'staff'), getAllRequests);
router.get('/:id', getRequest); // ownership/permission is checked inside the controller
router.patch('/:id/assign', requireRole('admin', 'staff'), validate(assignSchema), assignRequest);
router.patch('/:id/status', requireRole('admin', 'staff'), validate(updateStatusSchema), updateStatus);

module.exports = router;
