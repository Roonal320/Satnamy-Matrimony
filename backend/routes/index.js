const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const chatRoutes = require('./chat.routes');
const paymentRoutes = require('./payment.routes');
const matchRoutes = require('./match.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', profileRoutes);
router.use('/', chatRoutes);
router.use('/', paymentRoutes);
router.use('/', matchRoutes);
router.use('/', reportRoutes);

module.exports = router;
