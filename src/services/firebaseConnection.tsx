
import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

export default function initializeFirebaseClient(): {
  db: Firestore;
  auth: Auth;
} {
  const firebaseApp = initializeApp({
    apiKey: "AIzaSyA2PC474n__mmZ0Ams6Rk64lxYBId8g7Ss",
    authDomain: "testes-58b86.firebaseapp.com",
    projectId: "testes-58b86",
    storageBucket: "testes-58b86.appspot.com",
    messagingSenderId: "343031351828",
    appId: "1:343031351828:web:daba417d80158e9f787501",
    measurementId: "G-0P56E977GG"
  });
  
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return {
    db,
    auth,
  };
}