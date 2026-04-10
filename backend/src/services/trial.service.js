const prisma = require('../lib/prisma');
const { sendPushNotification } = require('../lib/firebase');
const { sendTrialWarningEmail } = require('../utils/email');

/**
 * Check and notify users about trial expiration
 * Call this function daily via cron job or Railway scheduler
 * @returns {Promise<object>} - Summary of notifications sent
 */
async function checkAndNotifyTrials() {
  const trialDays = parseInt(process.env.TRIAL_DAYS || 14);
  const now = new Date();

  const summary = {
    notified4DaysRemaining: 0,
    notifiedLastDay: 0,
    expiredTrials: 0,
    errors: [],
  };

  try {
    // Find users where trial is 10 days old (4 days remaining if trial is 14 days)
    const fourDaysRemainingDate = new Date();
    fourDaysRemainingDate.setDate(fourDaysRemainingDate.getDate() - (trialDays - 4));
    fourDaysRemainingDate.setHours(0, 0, 0, 0);

    const fourDaysRemainingEndDate = new Date(fourDaysRemainingDate);
    fourDaysRemainingEndDate.setDate(fourDaysRemainingEndDate.getDate() + 1);

    const usersWithFourDaysRemaining = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'TRIAL',
        trialStartDate: {
          gte: fourDaysRemainingDate,
          lt: fourDaysRemainingEndDate,
        },
      },
    });

    for (const user of usersWithFourDaysRemaining) {
      try {
        if (user.fcmToken) {
          await sendPushNotification(
            user.fcmToken,
            'Your Trial is Expiring',
            'Only 4 days left! Upgrade to Premium to keep using KCT Fitness.',
            { daysRemaining: '4' }
          );
        }
        await sendTrialWarningEmail(user.email, user.name, 4);
        summary.notified4DaysRemaining++;
      } catch (error) {
        console.error(`Failed to notify user ${user.id}:`, error);
        summary.errors.push(`Failed to notify ${user.email}: ${error.message}`);
      }
    }

    // Find users where trial is 13 days old (1 day remaining)
    const lastDayDate = new Date();
    lastDayDate.setDate(lastDayDate.getDate() - (trialDays - 1));
    lastDayDate.setHours(0, 0, 0, 0);

    const lastDayEndDate = new Date(lastDayDate);
    lastDayEndDate.setDate(lastDayEndDate.getDate() + 1);

    const usersWithLastDay = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'TRIAL',
        trialStartDate: {
          gte: lastDayDate,
          lt: lastDayEndDate,
        },
      },
    });

    for (const user of usersWithLastDay) {
      try {
        if (user.fcmToken) {
          await sendPushNotification(
            user.fcmToken,
            'Last Day of Your Trial!',
            'Your trial ends tomorrow! Upgrade now to continue.',
            { daysRemaining: '1' }
          );
        }
        await sendTrialWarningEmail(user.email, user.name, 1);
        summary.notifiedLastDay++;
      } catch (error) {
        console.error(`Failed to notify user ${user.id}:`, error);
        summary.errors.push(`Failed to notify ${user.email}: ${error.message}`);
      }
    }

    // Find users where trial is 14+ days old and status is still TRIAL
    const expiredTrialDate = new Date();
    expiredTrialDate.setDate(expiredTrialDate.getDate() - trialDays);

    const usersWithExpiredTrials = await prisma.user.findMany({
      where: {
        subscriptionStatus: 'TRIAL',
        trialStartDate: { lt: expiredTrialDate },
      },
    });

    for (const user of usersWithExpiredTrials) {
      try {
        // Update status
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'EXPIRED' },
        });

        // Send notification
        if (user.fcmToken) {
          await sendPushNotification(
            user.fcmToken,
            'Trial Expired',
            'Your trial has ended. Upgrade to Premium to continue.',
            { status: 'EXPIRED' }
          );
        }

        summary.expiredTrials++;
      } catch (error) {
        console.error(`Failed to update user ${user.id}:`, error);
        summary.errors.push(`Failed to update ${user.email}: ${error.message}`);
      }
    }

    console.log('Trial notification job completed:', summary);
    return summary;
  } catch (error) {
    console.error('Error in trial notification job:', error);
    throw error;
  }
}

/**
 * Schedule the trial notification job
 * This should be called during app startup to set up the cron job
 */
function scheduleTrialNotifications() {
  // This is a placeholder. In production, you would use:
  // - node-cron for local development
  // - Railway cron jobs for production
  // - AWS Lambda for serverless

  console.log('Trial notifications scheduled (configure with external cron service)');
}

module.exports = {
  checkAndNotifyTrials,
  scheduleTrialNotifications,
};
