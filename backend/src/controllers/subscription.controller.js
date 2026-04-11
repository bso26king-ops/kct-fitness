const prisma = require('../lib/prisma');
const stripe = require('../lib/stripe');
const { sendTrialWarningEmail } = require('../utils/email');

/**
 * Create subscription checkout session
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createSubscription(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has active subscription
    if (user.stripeCustomerId && user.subscriptionStatus === 'ACTIVE') {
      return res.status(409).json({ error: 'Already has active subscription' });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;

      // Save to database
      await prisma.user.update({
        where: { id: req.userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        userId: req.userId,
      },
    });

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel subscription
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function cancelSubscription(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    // Update user status
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        subscriptionStatus: 'CANCELLED',
        stripeSubscriptionId: null,
      },
    });

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get subscription status
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getSubscriptionStatus(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate trial days remaining
    const trialDaysElapsed = Math.floor(
      (Date.now() - new Date(user.trialStartDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const trialDaysRemaining = Math.max(0, parseInt(process.env.TRIAL_DAYS || 14) - trialDaysElapsed);

    let subscriptionDetails = null;
    if (user.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      subscriptionDetails = {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      };
    }

    res.json({
      subscriptionStatus: user.subscriptionStatus,
      trialDaysRemaining,
      trialStartDate: user.trialStartDate,
      subscriptionDetails,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle Stripe webhook
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function handleWebhook(req, res, next) {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.body;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object;
          const customerId = subscription.customer;

          // Find user by Stripe customer ID
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: 'ACTIVE',
              },
            });
          }
        }
        break;

      case 'customer.subscription.deleted':
        {
          const subscription = event.data.object;
          const customerId = subscription.customer;

          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'EXPIRED',
                stripeSubscriptionId: null,
              },
            });
          }
        }
        break;

      case 'invoice.payment_failed':
        {
          const invoice = event.data.object;
          const customerId = invoice.customer;

          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            console.log(`Payment failed for user ${user.id}`);
            // Could trigger email or other action here
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleWebhook,
};
