import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPR17aGX3r4tTfUWdC0N_HoemSJ2b9ewo",
  authDomain: "fieldcollectionsystem-b8256.firebaseapp.com",
  projectId: "fieldcollectionsystem-b8256",
  storageBucket: "fieldcollectionsystem-b8256.appspot.com",
  messagingSenderId: "1054702798515",
  appId: "1:1054702798515:web:ddcf70b532c00d12d952c6",
  measurementId: "G-FHX4H67E87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseApp = app;

const db = getFirestore(app);

export { db};
