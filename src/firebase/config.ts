// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyCS215kkKvJj14AaD6beVXh__PLUyI75kc",
  authDomain: "gugu-8c9ac.firebaseapp.com",
  projectId: "gugu-8c9ac",
  storageBucket: "gugu-8c9ac.appspot.com",
  messagingSenderId: "983774969554",
  appId: "1:983774969554:web:405efe52ec36e46124770b",
  measurementId: "G-X3YYWTSFRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);