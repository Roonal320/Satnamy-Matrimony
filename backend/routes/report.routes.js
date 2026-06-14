const express = require('express');
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/reports', authenticate, reportController.createReport);

module.exports = router;
