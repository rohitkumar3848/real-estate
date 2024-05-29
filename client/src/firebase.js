// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-d4e47.firebaseapp.com",
  projectId: "real-estate-d4e47",
  storageBucket: "real-estate-d4e47.appspot.com",
  messagingSenderId: "893566900924",
  appId: "1:893566900924:web:72bf916a21db9d1f4f0eb9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);