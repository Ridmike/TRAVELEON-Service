// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByLzsiPaDJr_6hMlZMPLs8F73D_G3h9uY",
  authDomain: "traveleon-938a8.firebaseapp.com",
  projectId: "traveleon-938a8",
  storageBucket: "traveleon-938a8.firebasestorage.app",
  messagingSenderId: "392184225656",
  appId: "1:392184225656:web:d4f32a239f0be81e14b28d",
  measurementId: "G-Y1HPQ6WRNZ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, storage, };
