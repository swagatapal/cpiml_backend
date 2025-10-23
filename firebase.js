const admin = require('firebase-admin');
const config = require('./config');

// Debug: Log the service account status
console.log('FIREBASE_SERVICE_ACCOUNT status:', config.firebase.serviceAccount ? 'Provided' : 'NOT Provided');
if (!config.firebase.serviceAccount || config.firebase.serviceAccount === '') {
  console.warn('Firebase service account not provided or is empty. Push notifications will not be enabled.');
  module.exports = null; // Export null if not initialized
} else {
  try {
    const serviceAccount = JSON.parse(config.firebase.serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
    // Add debug log to check if messaging is available
    if (admin.app().messaging) {
      console.log('Firebase Messaging service is available after initialization.');
    } else {
      console.error('Firebase Messaging service is NOT available after initialization.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    module.exports = null; // Export null if initialization fails
  }
}

module.exports = admin;
