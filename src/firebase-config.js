import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQsGiC_OWq3-kv7F1XubeV7NZK5JHLeco",
  authDomain: "player-bidding.firebaseapp.com",
  projectId: "player-bidding",
  storageBucket: "player-bidding.appspot.com",
  messagingSenderId: "63210784166",
  appId: "1:63210784166:web:7d2c911a9d212a2e333b67",
  measurementId: "G-JX8E8M2WCM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
