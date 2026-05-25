const Order = require('../models/Order');
const User = require('../models/User');
const paymentService = require('../services/payment.service');
const uuid = require('uuid');

const PLANS = {
  "gold_1": { "name": "Gold", "months": 1, "amount": 50000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_3": { "name": "Gold", "months": 3, "amount": 120000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_6": { "name": "Gold", "months": 6, "amount": 200000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "gold_12": { "name": "Gold", "months": 12, "amount": 300000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"] },
  "diamond_1": { "name": "Diamond", "months": 1, "amount": 100000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_3": { "name": "Diamond", "months": 3, "amount": 240000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_6": { "name": "Diamond", "months": 6, "amount": 400000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "diamond_12": { "name": "Diamond", "months": 12, "amount": 600000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"] },
  "platinum_1": { "name": "Platinum", "months": 1, "amount": 150000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_3": { "name": "Platinum", "months": 3, "amount": 390000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_6": { "name": "Platinum", "months": 6, "amount": 600000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
  "platinum_12": { "name": "Platinum", "months": 12, "amount": 990000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"] },
};

/**
 * Returns available plans.
 */
function getPlans(req, res) {
  return res.status(200).json(PLANS);
}

/**
 * Creates order and signs with a checksum hash.
 */
async function createOrder(req, res) {
  try {
    const user = req.user;
    const { plan, amount, frontend_url } = req.body;

    if (!plan || amount === undefined) {
      return res.status(422).json({ detail: "Missing required fields" });
    }

    const planInfo = PLANS[plan];
    if (!planInfo) {
      return res.status(400).json({ detail: "Invalid plan" });
    }

    const payuKey = process.env.PAYU_MERCHANT_KEY || "dummy_merchant_key";
    const payuSalt = process.env.PAYU_MERCHANT_SALT || "dummy_merchant_salt";
    const payuEnv = process.env.PAYU_ENV || "sandbox";

    const payuUrl = payuEnv === "sandbox" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";

    const txnid = `txn_${uuid.v4().replace(/-/g, '').slice(0, 12)}`;

    const amountInRupees = parseFloat(amount) / 100.0;
    const amountStr = amountInRupees.toFixed(2);

    const productinfo = plan;
    const firstname = user.name || "Customer";
    const email = user.email;
    const phone = user.phone || "";

    // Sanitize phone
    let phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      phoneDigits = "9999999999";
    }

    const host = req.headers.host || "localhost:8000";
    const proto = req.headers['x-forwarded-proto'] || req.protocol || "http";
    const callbackUrl = `${proto}://${host}/api/premium/payu-callback`;

    // Compute cryptographic order hash
    const generatedHash = paymentService.generateOrderHash({
      key: payuKey,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      salt: payuSalt
    });

    await Order.create({
      id: txnid,
      user_id: user.id,
      order_id: txnid,
      plan: plan,
      plan_name: planInfo.name,
      months: planInfo.months,
      amount: amount,
      status: "created",
      frontend_url: frontend_url || null,
      created_at: new Date().toISOString()
    });

    return res.status(200).json({
      payu_url: payuUrl,
      key: payuKey,
      txnid: txnid,
      amount: amountStr,
      productinfo: productinfo,
      firstname: firstname,
      email: email,
      phone: phoneDigits,
      surl: callbackUrl,
      furl: callbackUrl,
      hash: generatedHash
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Handle POST request callback redirected from PayU servers.
 */
async function payuCallback(req, res) {
  try {
    const data = req.body || {};

    const txnid = data.txnid;
    const status = data.status;
    const amount = data.amount;
    const productinfo = data.productinfo;
    const firstname = data.firstname;
    const email = data.email;
    const returnedHash = data.hash;
    const key = data.key;

    const order = await Order.findOne({ order_id: txnid });

    const corsOriginsEnv = process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000";
    const fallbackFrontend = corsOriginsEnv.split(',')[0].trim();

    if (!order) {
      console.error(`PayU Callback: Order ${txnid} not found`);
      return res.redirect(303, `${fallbackFrontend}/premium?status=failure&error=Order+not+found`);
    }

    const frontendUrl = order.frontend_url || fallbackFrontend;
    const payuSalt = process.env.PAYU_MERCHANT_SALT || "dummy_merchant_salt";

    // Verify hash integrity
    const isHashValid = paymentService.verifyCallbackHash({
      salt: payuSalt,
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
      returnedHash,
      body: data
    });

    if (!isHashValid) {
      console.error(`PayU Callback: Hash verification failed for txn ${txnid}. Calculated hash mismatch.`);
      await Order.updateOne(
        { order_id: txnid },
        { $set: { status: "failed", error: "Hash verification failed" } }
      );
      return res.redirect(303, `${frontendUrl}/premium?status=failure&error=Hash+verification+failed`);
    }

    if (status === "success") {
      await Order.updateOne(
        { order_id: txnid },
        { $set: { status: "completed", payment_id: data.mihpayid || txnid } }
      );

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

      return res.redirect(303, `${frontendUrl}/premium?status=success&txnid=${txnid}`);
    } else {
      await Order.updateOne(
        { order_id: txnid },
        { $set: { status: "failed", payment_id: data.mihpayid || null, error_message: data.error_Message || "Payment failed" } }
      );
      return res.redirect(303, `${frontendUrl}/premium?status=failure&txnid=${txnid}`);
    }
  } catch (err) {
    console.error("PayU Callback Error:", err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  getPlans,
  createOrder,
  payuCallback
};
