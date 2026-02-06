import { initializeApp } from "firebase/app";
// getAuth වෙනුවට initializeAuth ගන්නවා (Mobile වලට හරියන විදිහට)
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: ඔයාගේ Console එකෙන් ගත්ත ඇත්ත Keys මෙතනට දාන්න
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

// මෙන්න මේ කෑල්ල තමයි Crash වෙන එක නවත්තන්නේ 👇
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };

