// Firebase configuration object
export const firebaseConfig = {
  apiKey: "AIzaSyAi9DRUvwgjGk1_uQiVDxDRZAeGmPr4uyM",
  authDomain: "web3-game-5db76.firebaseapp.com",
  projectId: "web3-game-5db76",
  storageBucket: "web3-game-5db76.firebasestorage.app",
  messagingSenderId: "122461991209",
  appId: "1:122461991209:web:cb83353fdbd0be4922c738",
  measurementId: "G-PG0SJ529L3"
};

// Firebase emulator configuration
export const useEmulator = process.env.NODE_ENV === 'development';
export const emulatorHost = 'localhost';
export const emulatorPorts = {
  firestore: 8080,
  auth: 9099
};