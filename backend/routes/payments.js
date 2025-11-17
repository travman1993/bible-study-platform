// backend/routes/payments.js - FIXED VERSION
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Define pricing
const PLANS = {
  starter_monthly: {
    name: 'Starter',
    price: 1999, // cents ($19.99)
    period: 'monthly',
    maxParticipants: 50,
    features: ['Basic Bible search', 'Highlighting', 'Live video', 'Chat']
  },
  starter_yearly: {
    name: 'Starter',
    price: 19999, // cents ($199.99)
    period: 'yearly',
    maxParticipants: 50,
    features: ['Basic Bible search', 'Highlighting', 'Live video', 'Chat']
  },
  pro_monthly: {
    name: 'Pro',
    price: 4999, // cents ($49.99)
    period: 'monthly',
    maxParticipants: 500,
    features: ['Everything in Starter', '5 Bible versions', 'Recordings', 'Analytics']
  },
  pro_yearly: {
    name: 'Pro',
    price: 49999, // cents ($499.99)
    period: 'yearly',
    maxParticipants: 500,
    features: ['Everything in Starter', '5 Bible versions', 'Recordings', 'Analytics']
  }
};

// CREATE CHECKOUT SESSION
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment system not configured. Please contact support.' 
      });
    }

    const { plan } = req.body;
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

    // Get price ID from environment variables
    const priceIdEnvVar = `STRIPE_${plan.toUpperCase()}_PRICE_ID`;
    const stripePrice = process.env[priceIdEnvVar];
    
    if (!stripePrice) {
      console.error(`Missing Stripe price ID: ${priceIdEnvVar}`);
      return res.status(500).json({ 
        error: 'Payment plan not configured. Please contact support.' 
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?cancel=true`,
      metadata: {
        plan,
        userId: user._id.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  }
});

// WEBHOOK HANDLER (called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment system not configured' });
  }

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
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        // Create subscription record in DB
        const subscription = new Subscription({
          userId,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          plan: PLANS[plan].name.toLowerCase(),
          status: 'active',
          pricePerMonth: PLANS[plan].price,
          maxParticipants: PLANS[plan].maxParticipants,
          features: PLANS[plan].features,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        await subscription.save();

        // Update user
        const user = await User.findById(userId);
        if (user) {
          user.subscriptionStatus = 'active';
          user.stripeCustomerId = session.customer;
          await user.save();
        }

        console.log(`✅ Subscription created for user ${userId}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      // Update subscription status
      const sub = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { status: 'cancelled', cancelledAt: new Date() }
      );

      // Update user
      if (sub) {
        const user = await User.findById(sub.userId);
        if (user) {
          user.subscriptionStatus = 'cancelled';
          await user.save();
        }
      }

      console.log(`❌ Subscription cancelled: ${subscription.id}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: 'Webhook failed', details: err.message });
  }
});

// GET SUBSCRIPTION STATUS
router.get('/subscription', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await Subscription.findOne({ userId: req.userId });

    res.json({
      success: true,
      user: {
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt
      },
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        maxParticipants: subscription.maxParticipants,
        features: subscription.features,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : null
    });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// CANCEL SUBSCRIPTION
router.post('/cancel-subscription', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    // Cancel at end of billing period
    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    res.json({
      success: true,
      message: 'Subscription will be cancelled at end of billing period'
    });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// BILLING PORTAL
router.post('/billing-portal', verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const user = await User.findById(req.userId);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Billing portal error:', err);
    res.status(500).json({ error: 'Failed to create billing portal' });
  }
});

module.exports = router;