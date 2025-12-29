const express = require("express");
const { createCheckoutSession, verifyCheckoutSession } = require("../controllers/paymentController.js");

const router = express.Router();

// Stripe Checkout
router.post("/create-checkout-session", createCheckoutSession);
router.get("/verify-session", verifyCheckoutSession);
router.get("/verify", verifyCheckoutSession);      // <-- ADD THIS (alias)
router.get("/verify-checkout", verifyCheckoutSession); // optional extra alias


// Stripe Webhook (must receive raw body)
// router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = router;
