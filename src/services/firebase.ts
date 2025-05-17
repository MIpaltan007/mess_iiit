
// src/services/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// Optional: Import getAnalytics if you plan to use it
// import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB2Kc7uqhj6CMGQnBk7Zx7ZkD5gOs-U1UQ",
  authDomain: "meal-plan-hub-h4g8m.firebaseapp.com",
  projectId: "meal-plan-hub-h4g8m",
  storageBucket: "meal-plan-hub-h4g8m.firebasestorage.app",
  messagingSenderId: "836129799986",
  appId: "1:836129799986:web:274f0cf5a246a679c3a12b"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Optional: Initialize Analytics
// let analytics;
// if (typeof window !== 'undefined') {
//   isSupported().then((supported) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//     }
//   });
// }

export { app }; // export { app, analytics }; if using analytics
