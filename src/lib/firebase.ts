import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Allow environment variables to override committed config for production deployments
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || config.apiKey,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || config.appId,
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || config.measurementId || undefined
};

const isDev = import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');
const isEmulator = import.meta.env?.VITE_USE_FIREBASE_EMULATOR === 'true';
const allowProdInDev = import.meta.env?.VITE_ALLOW_PROD_FIREBASE === 'true';

// Startup safety guardrail (MULTI_SCHOOL_PLAN.md Section 0)
// Prevent accidental connection or cross-tenant modification to the live production database
if (isDev && !isEmulator && !allowProdInDev) {
  const prodProjectId = config.projectId;
  const prodDatabaseId = config.firestoreDatabaseId;
  const currentProjectId = firebaseConfig.projectId;
  const currentDatabaseId = import.meta.env?.VITE_FIRESTORE_DATABASE_ID || config.firestoreDatabaseId;

  if (currentProjectId === prodProjectId && currentDatabaseId === prodDatabaseId) {
    console.warn(
      '⚠️ [SAFETY GUARDRAIL]: Operating in development with live production database credentials. ' +
      'To test multi-tenant isolation safely without touching production, set VITE_USE_FIREBASE_EMULATOR=true ' +
      'or provide a test database ID in .env.local. (Override with VITE_ALLOW_PROD_FIREBASE=true if explicitly intended).'
    );
  }
}

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if provided
const firestoreDatabaseId = import.meta.env?.VITE_FIRESTORE_DATABASE_ID || config.firestoreDatabaseId;

export const firestore = firestoreDatabaseId && firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

// Connect emulators if enabled
if (isEmulator) {
  try {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.info('🔌 Connected to local Firebase Emulators (Firestore: 8080, Auth: 9099)');
  } catch (err) {
    console.warn('Failed to connect to Firebase Emulators:', err);
  }
}

