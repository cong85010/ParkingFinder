// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, initializeAuth, getReactNativePersistence  } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt2BjsZeWjLbn3gKkimhyElmEV8ti85KM",
  authDomain: "parking-near-me-55381.firebaseapp.com",
  projectId: "parking-near-me-55381",
  storageBucket: "parking-near-me-55381.appspot.com",
  messagingSenderId: "338228096556",
  appId: "1:338228096556:web:492205a37066509323eb89",
  databaseURL: 'https://parking-near-me-55381-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const auth = getAuth();
export const db = getFirestore(app);
