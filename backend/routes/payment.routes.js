const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/plans', paymentController.getPlans);
router.post('/premium/create-order', authenticate, paymentController.createOrder);

// Dodo Payments webhook — signature is verified automatically by the Webhooks middleware
// Only register the route if a real webhook secret is configured (not a placeholder)
const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
const isSecretConfigured = webhookSecret && !webhookSecret.startsWith('your_');
if (isSecretConfigured) {
  const { Webhooks } = require('@dodopayments/express');
  router.post(
    '/premium/dodo-webhook',
    Webhooks({
      webhookKey: webhookSecret,
      onPayload: async (payload) => {
        await paymentController.handleDodoWebhook(payload);
      },
    })
  );
} else {
  console.warn('[Payment Routes] DODO_PAYMENTS_WEBHOOK_SECRET not set — webhook endpoint disabled. Set it in .env to enable payment webhooks.');
  router.post('/premium/dodo-webhook', (req, res) => {
    res.status(503).json({ detail: 'Webhook endpoint not configured. Set DODO_PAYMENTS_WEBHOOK_SECRET in .env.' });
  });
}

module.exports = router;
