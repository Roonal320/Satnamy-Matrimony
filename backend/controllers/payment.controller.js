const Order = require('../models/Order');
const User = require('../models/User');
const paymentService = require('../services/payment.service');

/**
 * Plan definitions with Dodo product IDs.
 * Replace the placeholder product IDs (pdt_*) with your actual
 * Dodo Payments product IDs from the dashboard.
 */
const PLANS = {
  "gold_1": { "name": "Gold", "months": 1, "amount": 49900, "productId": "pdt_0Nh2ItEtNToW0xbRoANuB", "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_3": { "name": "Gold", "months": 3, "amount": 99900, "productId": "pdt_0Nh2J9w0cxu3JhiVd8O6A", "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_6": { "name": "Gold", "months": 6, "amount": 149900, "productId": "pdt_0Nh2JVxUD7WcAtUTwutO1", "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_12": { "name": "Gold", "months": 12, "amount": 199900, "productId": "pdt_0Nh2JlsBCXPUHuBGKSzQc", "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "diamond_1": { "name": "Diamond", "months": 1, "amount": 99900, "productId": "pdt_0Nh2K1EYnvK0tG3Y7kuKS", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_3": { "name": "Diamond", "months": 3, "amount": 199900, "productId": "pdt_0Nh2LbOxjk2DVOeJYHew8", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_6": { "name": "Diamond", "months": 6, "amount": 299900, "productId": "pdt_0Nh2M3HDDKbqfsfbld7Pt", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_12": { "name": "Diamond", "months": 12, "amount": 399900, "productId": "pdt_0Nh2MLhjAIeWsOePNRwtC", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "platinum_1": { "name": "Platinum", "months": 1, "amount": 149900, "productId": "pdt_0Nh2MeaZbF8D00YK4ZgUD", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_3": { "name": "Platinum", "months": 3, "amount": 299900, "productId": "pdt_0Nh2MnLRKk2IpqTG66MCh", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_6": { "name": "Platinum", "months": 6, "amount": 449900, "productId": "pdt_0Nh2MwfInqwYgenB9yctm", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_12": { "name": "Platinum", "months": 12, "amount": 599900, "productId": "pdt_0Nh2N61xDQiA32znTpkY4", "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
};

/**
 * Returns available plans.
 */
function getPlans(req, res) {
  return res.status(200).json(PLANS);
}

/**
 * Creates a Dodo Payments checkout session and returns the checkout URL.
 */
async function createOrder(req, res) {
  try {
    // Launch promotion guard — comment out or remove when testing/live
    // return res.status(403).json({ detail: "Direct ordering is disabled. All premium features are currently active and free under the launch promotion." });

    const user = req.user;
    const { plan, amount, frontend_url } = req.body;

    if (!plan || amount === undefined) {
      return res.status(422).json({ detail: "Missing required fields" });
    }

    const planInfo = PLANS[plan];
    if (!planInfo) {
      return res.status(400).json({ detail: "Invalid plan" });
    }

    // Build the return URL for after checkout
    const returnUrl = frontend_url
      ? `${frontend_url}/premium?status=success`
      : `${(process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')[0].trim()}/premium?status=success`;

    // Create Dodo Payments checkout session
    const session = await paymentService.createCheckoutSession({
      productId: planInfo.productId,
      quantity: 1,
      customerEmail: user.email,
      customerName: user.name || 'Customer',
      returnUrl,
    });

    // Persist the order record
    await Order.create({
      id: session.session_id,
      user_id: user.id,
      order_id: session.session_id,
      session_id: session.session_id,
      plan: plan,
      plan_name: planInfo.name,
      months: planInfo.months,
      amount: amount,
      status: "pending",
      payment_gateway: "dodo",
      frontend_url: frontend_url || null,
      created_at: new Date().toISOString()
    });

    return res.status(200).json({
      checkout_url: session.checkout_url,
      session_id: session.session_id,
    });
  } catch (err) {
    console.error("Dodo Payments create order error:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Handle Dodo Payments webhook events.
 * Called by the @dodopayments/express Webhooks middleware which
 * verifies the signature automatically before passing the payload.
 */
async function handleDodoWebhook(payload) {
  try {
    const eventType = payload.event_type || payload.type;
    const paymentData = payload.data || payload;

    console.log(`Dodo Webhook received: ${eventType}`);

    if (eventType === 'payment.succeeded' || eventType === 'payment_succeeded') {
      const sessionId = paymentData.session_id || paymentData.checkout_session_id || paymentData.payment_id;

      const order = await Order.findOne({
        $or: [
          { session_id: sessionId },
          { order_id: sessionId }
        ]
      });

      if (!order) {
        console.error(`Dodo Webhook: Order not found for session ${sessionId}`);
        return;
      }

      // Mark order completed
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            status: "completed",
            payment_id: paymentData.payment_id || sessionId
          }
        }
      );

      // Activate premium for the user
      const planInfo = PLANS[order.plan] || {};
      const months = planInfo.months || 3;
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30 * months);

      await User.updateOne(
        { id: order.user_id },
        {
          $set: {
            is_premium: true,
            premium_plan: order.plan,
            premium_name: planInfo.name || "Gold",
            premium_features: planInfo.features || [],
            premium_until: premiumUntil.toISOString()
          }
        }
      );

      console.log(`Dodo Webhook: Premium activated for user ${order.user_id}, plan ${order.plan}`);

    } else if (eventType === 'payment.failed' || eventType === 'payment_failed') {
      const sessionId = paymentData.session_id || paymentData.checkout_session_id || paymentData.payment_id;

      const order = await Order.findOne({
        $or: [
          { session_id: sessionId },
          { order_id: sessionId }
        ]
      });

      if (order) {
        await Order.updateOne(
          { _id: order._id },
          {
            $set: {
              status: "failed",
              error_message: paymentData.error || "Payment failed"
            }
          }
        );
        console.log(`Dodo Webhook: Payment failed for order ${order.order_id}`);
      }
    }
  } catch (err) {
    console.error("Dodo Webhook processing error:", err);
  }
}

module.exports = {
  getPlans,
  createOrder,
  handleDodoWebhook
};
