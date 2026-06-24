import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent as fbLogEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let analytics = null;

// Only initialize if minimum config is present
const hasConfig = firebaseConfig.apiKey && firebaseConfig.appId;

if (hasConfig && typeof window !== 'undefined') {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    // Analytics only runs in browser environments
    analytics = getAnalytics(app);
  } catch (error) {
    // Firebase Analytics init failed — non-critical
  }
}

/**
 * Log analytics event. Safe to call even if Firebase fails to initialize.
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      fbLogEvent(analytics, eventName, eventParams);
    } catch (e) {
      // Analytics event logging failed — non-critical
    }
  }
};

export { app, analytics };
