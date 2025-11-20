// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1PGNRxnyQsWrFE9AWtfwKtujtFALEhW0",
  authDomain: "medsync-fae5d.firebaseapp.com",
  projectId: "medsync-fae5d",
  storageBucket: "medsync-fae5d.firebasestorage.app",
  messagingSenderId: "743668138340",
  appId: "1:743668138340:web:e6459a00a7a3adad437a71",
  measurementId: "G-X1T2J71VQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);