// backend/routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Define pricing
const PLANS = {
  starter: {
    name: 'Starter',
    price: 1900, // cents
    stripePrice: process.env.STRIPE_PRICE_STARTER, // set in Stripe dashboard
    participants: 50,
    features: ['Basic Bible search', 'Highlighting', 'Live video']
  },
  pro: {
    name: 'Pro',
    price: 4900,
    stripePrice: process.env.STRIPE_PRICE_PRO,
    participants: 500,
    features: ['Everything in Starter', '5 Bible versions', 'Recordings', 'Analytics']
  },
  ministry: {
    name: 'Ministry',
    price: 14900,
    stripePrice: process.env.STRIPE_PRICE_MINISTRY,
    participants: 5000,
    features: ['Everything in Pro', 'Unlimited features', 'API access', 'White-label']
  }
};

// CREATE CHECKOUT SESSION
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await User.findById(req.userId);
    const planData = PLANS[plan];

    // Create Stripe customer if needed
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planData.stripePrice,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        plan,
        userId: user._id.toString()
      }
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// WEBHOOK HANDLER (called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle subscription events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      // Create subscription record in DB
      const subscription = new Subscription({
        userId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        plan,
        status: 'active',
        pricePerMonth: PLANS[plan].price,
        maxParticipants: PLANS[plan].participants,
        features: PLANS[plan].features
      });

      await subscription.save();

      // Update user
      const user = await User.findById(userId);
      user.subscriptionStatus = 'active';
      user.stripeCustomerId = session.customer;
      await user.save();

      console.log(`✅ Subscription created for user ${userId}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      // Update subscription status
      await Subscription.updateOne(
        { stripeSubscriptionId: subscription.id },
        { status: 'cancelled', cancelledAt: new Date() }
      );

      // Update user
      const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
      if (sub) {
        const user = await User.findById(sub.userId);
        user.subscriptionStatus = 'cancelled';
        await user.save();
      }

      console.log(`❌ Subscription cancelled: ${subscription.id}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: 'Webhook failed' });
  }
});

module.exports = router;