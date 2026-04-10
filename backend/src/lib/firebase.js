const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.warn('Firebase Admin initialization failed (notifications disabled):', error.message);
  }
}

/**
 * Send a push notification via Firebase Cloud Messaging
 * @param {string} fcmToken - User's FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional extra data payload
 * @returns {Promise<string|null>} - FCM message ID or null
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!admin.apps.length || !fcmToken) {
    console.log(`[Notification] Would send: "${title}" - "${body}"`);
    return null;
  }
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('FCM send error:', error);
    return null;
  }
}

/**
 * Send push notification to multiple tokens
 * @param {string[]} fcmTokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional extra data payload
 * @returns {Promise<object|null>} - Batch response or null
 */
async function sendMulticastNotification(fcmTokens, title, body, data = {}) {
  if (!admin.apps.length || !fcmTokens.length) return null;
  const message = {
    tokens: fcmTokens,
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
  };
  return admin.messaging().sendEachForMulticast(message);
}

module.exports = { sendPushNotification, sendMulticastNotification };
