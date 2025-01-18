// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyD8ZyuluGyShYAKrV47Zysv7tucYamB97g",
//   authDomain: "gugu-auth.firebaseapp.com",
//   projectId: "gugu-auth",
//   storageBucket: "gugu-auth.appspot.com",
//   messagingSenderId: "839522501088",
//   appId: "1:839522501088:web:d102e02d10e518a580eb85",
//   measurementId: "G-J0NMHVCZKZ"
// };
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