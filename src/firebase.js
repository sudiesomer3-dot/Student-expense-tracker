import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgquL7L6a4eDMlUozqwTjEwgJR7PRO2Js",
  authDomain: "spendsmart-956ad.firebaseapp.com",
  projectId: "spendsmart-956ad",
  storageBucket: "spendsmart-956ad.firebasestorage.app",
  messagingSenderId: "446874738336",
  appId: "1:446874738336:web:eecba1120a08e3093cb3c5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);