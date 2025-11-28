import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiVCVEa7HiXHHJSx8frpitqqspQBlvN4g",
  authDomain: "cinema-tix-app.firebaseapp.com",
  projectId: "cinema-tix-app",
  storageBucket: "cinema-tix-app.firebasestorage.app",
  messagingSenderId: "497740074012",
  appId: "1:497740074012:web:90aef7aeb527e01f1923d9",
  measurementId: "G-BNK7251WDJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global App ID helper
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';