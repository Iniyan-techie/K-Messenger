import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCiKkrvKDSdKM1DEXggVpyNVMurNtpl-Cc",
  authDomain: "k-messenger-baa7a.firebaseapp.com",
  databaseURL: "https://k-messenger-baa7a-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "k-messenger-baa7a",
  storageBucket: "k-messenger-baa7a.firebasestorage.app",
  messagingSenderId: "983646824389",
  appId: "1:983646824389:web:eebc90e61b3f019c74cdac",
  measurementId: "G-R393X0Y0EM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
