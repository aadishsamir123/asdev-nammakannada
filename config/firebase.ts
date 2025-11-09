import { initializeApp } from 'firebase/app';
import {
  getAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCE5mGRu_7EDdET0S5Bf-HvtKJld4SnF_k",
  authDomain: "asdev-nammakannada.firebaseapp.com",
  projectId: "asdev-nammakannada",
  storageBucket: "asdev-nammakannada.firebasestorage.app",
  messagingSenderId: "509985955615",
  appId: "1:509985955615:web:f86d679839441e42efda2a",
  measurementId: "G-R1NQ8CH368"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
