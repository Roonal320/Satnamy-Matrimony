const DodoPayments = require('dodopayments').default;

/**
 * Initialize Dodo Payments client.
 * Uses DODO_PAYMENTS_API_KEY from environment and defaults to test_mode.
 */
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: process.env.DODO_PAYMENTS_ENV || 'test_mode',
});

/**
 * Create a Dodo Payments checkout session for a given product.
 * @param {Object} params
 * @param {string} params.productId - The Dodo product ID
 * @param {number} params.quantity - Quantity (default 1)
 * @param {string} params.customerEmail - Customer email
 * @param {string} params.customerName - Customer name
 * @param {string} params.returnUrl - URL to redirect after payment
 * @returns {Promise<Object>} - The checkout session with session_id and checkout_url
 */
async function createCheckoutSession({ productId, quantity = 1, customerEmail, customerName, returnUrl }) {
  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity }],
    customer: {
      email: customerEmail,
      name: customerName,
    },
    payment_link: true,
    return_url: returnUrl,
  });

  return session;
}

module.exports = {
  client,
  createCheckoutSession
};
