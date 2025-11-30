import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyCNPU142iQ5U2L_qOO47Kl4etBvqRnRWyc",
  authDomain: "auth-majorproject.firebaseapp.com",
  projectId: "auth-majorproject",
  storageBucket: "auth-majorproject.firebasestorage.app",
  messagingSenderId: "963167486500",
  appId: "1:963167486500:web:6f4888f18971d3de618eb1",
  measurementId: "G-BPQSMN8NCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
