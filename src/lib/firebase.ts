
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCsx_KVzFONfVMcF-vXXKlHQlKzN7x2YM",
  authDomain: "day-weaver-3aye8.firebaseapp.com",
  projectId: "day-weaver-3aye8",
  storageBucket: "day-weaver-3aye8.firebasestorage.app",
  messagingSenderId: "227303256933",
  appId: "1:227303256933:web:6414ae58136b88f11e678c"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export default app;
