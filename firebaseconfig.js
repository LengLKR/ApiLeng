const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGrDbcLB6Xx8t8rh2noyFrSPVoRYdeizU",
  authDomain: "myapp-e0219.firebaseapp.com",
  databaseURL:
    "https://myapp-e0219-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myapp-e0219",
  storageBucket: "myapp-e0219.appspot.com",
  messagingSenderId: "265220609618",
  appId: "1:265220609618:web:63c2055428b0a05baef18b",
  measurementId: "G-J63G9Y5YHJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
