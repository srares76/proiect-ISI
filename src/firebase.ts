// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOxFMtVPCu0HH3uOS43XwakkkLln-Wtvs",
  authDomain: "kaufland-supermarket-5f006.firebaseapp.com",
  databaseURL:
    "https://kaufland-supermarket-5f006-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kaufland-supermarket-5f006",
  storageBucket: "kaufland-supermarket-5f006.appspot.com",
  messagingSenderId: "695359676823",
  appId: "1:695359676823:web:7da1ef83848e2b2ccfe4d2",
  measurementId: "G-1K8TGCLLPS",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
