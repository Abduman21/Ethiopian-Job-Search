// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnMkhXM1JoiP7oM4VQdcAJn78N9tG7yxk",
  authDomain: "ethio-jobs.firebaseapp.com",
  projectId: "ethio-jobs",
  storageBucket: "ethio-jobs.firebasestorage.app",
  messagingSenderId: "288964935207",
  appId: "1:288964935207:web:c780cead104425328f9802"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore for use in the app
export const auth = getAuth(app);
export const db = getFirestore(app);