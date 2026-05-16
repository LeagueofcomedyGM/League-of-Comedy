import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxjsVxFK0Ho-vCppxZIqLDwuUxqucDyk4",
  authDomain: "league-of-comedy-user-auth.firebaseapp.com",
  projectId: "league-of-comedy-user-auth",
  storageBucket: "league-of-comedy-user-auth.firebasestorage.app",
  messagingSenderId: "1023610574711",
  appId: "1:1023610574711:web:7d3bd238894b3776f7b372"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
