import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig, useEmulator, emulatorHost, emulatorPorts } from './firebase/config';

// Initialize Firebase with error handling
function initializeFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    let analytics = null;

    // Connect to emulator in development
    if (useEmulator) {
      try {
        connectFirestoreEmulator(db, emulatorHost, emulatorPorts.firestore);
        console.log('Connected to Firestore emulator');
      } catch (error) {
        console.warn('Failed to connect to Firestore emulator:', error);
      }
    } else {
      // Initialize analytics in production only
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
      }
    }

    return { app, db, analytics };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase');
  }
}

const { app, db, analytics } = initializeFirebase();

export { app, db, analytics };