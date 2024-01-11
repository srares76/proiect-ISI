import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

export { db };
