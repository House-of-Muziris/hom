import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth";
import { getFirestore as firebaseGetFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics as firebaseGetAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if we're in a browser environment with valid config
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const isBrowser = typeof window !== "undefined";

// Lazy initialization pattern to prevent build-time errors
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _analytics: Analytics | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    if (!isConfigValid) {
      throw new Error("Firebase configuration is missing. Ensure environment variables are set.");
    }
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

function getAuth(): Auth {
  if (!_auth) {
    _auth = firebaseGetAuth(getApp());
  }
  return _auth;
}

function getDb(): Firestore {
  if (!_db) {
    _db = firebaseGetFirestore(getApp());
  }
  return _db;
}

function getAnalyticsInstance(): Analytics | null {
  if (isBrowser && !_analytics && isConfigValid) {
    try {
      _analytics = firebaseGetAnalytics(getApp());
    } catch {
      // Analytics may fail in some environments
      return null;
    }
  }
  return _analytics;
}

// Export getters for lazy initialization
export { getApp, getAuth, getDb, getAnalyticsInstance };
