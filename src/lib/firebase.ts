import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCRRbWp50w9YKe-jXKEs9SJ4qkVcV0UhlI",
  authDomain: "studio-7969231078-4753a.firebaseapp.com",
  projectId: "studio-7969231078-4753a",
  storageBucket: "studio-7969231078-4753a.appspot.com",
  messagingSenderId: "193649213751",
  appId: "1:193649213751:web:ac0c613424a1b9c34bdab2",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
