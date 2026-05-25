const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/plans', paymentController.getPlans);
router.post('/premium/create-order', authenticate, paymentController.createOrder);
router.post('/premium/payu-callback', express.urlencoded({ extended: true }), paymentController.payuCallback);

module.exports = router;
