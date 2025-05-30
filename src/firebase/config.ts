// client/src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBohmZXPBoJQuLU3yHsycIF5A4DJpi_LpM",
    authDomain: "volunterconnect.firebaseapp.com",
    projectId: "volunterconnect",
    storageBucket: "volunterconnect.firebasestorage.app",
    messagingSenderId: "255430249976",
    appId: "1:255430249976:web:265454f9358896c7845a0d",
    measurementId: "G-NDS0VHCDV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
