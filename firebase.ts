import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp2KD90l4BebU7pysiz9w2M_Mo1Vy3v-E",
  authDomain: "inffy-afa14.firebaseapp.com",
  projectId: "inffy-afa14",
  storageBucket: "inffy-afa14.appspot.com",
  messagingSenderId: "341852788991",
  appId: "1:341852788991:web:9c460351c5903d6a76d4ca",
  measurementId: "G-1KD177VFQ3"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


export const auth = firebase.auth();
export const db = firebase.firestore();
