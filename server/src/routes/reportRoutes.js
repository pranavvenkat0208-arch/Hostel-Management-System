const { Router } = require('express');
const { getRevenueReport, getOccupancyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = Router();

router.use(protect, requireRole('admin'));
router.get('/revenue', getRevenueReport);
router.get('/occupancy', getOccupancyReport);

module.exports = router;
