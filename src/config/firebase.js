import { initializeApp } from "firebase/app";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyB34ElszTpYYL1m0TytibTpSf6KopU6OvI",
  authDomain: "uov-events.firebaseapp.com",
  projectId: "uov-events",
  storageBucket: "uov-events.firebasestorage.app",
  messagingSenderId: "922989907061",
  appId: "1:922989907061:web:ad3e09ef49d5a1d8abbc3c",
  measurementId: "G-E1G3Y29FJH"
};

const app = initializeApp(firebaseConfig);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };

