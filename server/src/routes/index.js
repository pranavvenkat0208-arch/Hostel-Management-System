const { Router } = require('express');
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const residentRoutes = require('./residentRoutes');
const allocationRoutes = require('./allocationRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const userRoutes = require('./userRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/residents', residentRoutes);
router.use('/allocations', allocationRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/users', userRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
