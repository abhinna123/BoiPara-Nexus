import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables for security
// Ensure these are added to your .env file
const firebaseConfig = {
  apiKey: "AIzaSyBSVLaJJhoFHN2yxw6n33pt5ao994laAOI",
  authDomain: "boipara-nexus-v2.firebaseapp.com",
  projectId: "boipara-nexus-v2",
  storageBucket: "boipara-nexus-v2.firebasestorage.app",
  messagingSenderId: "797148387920",
  appId: "1:797148387920:web:5dffe03cd4f99685354f55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
