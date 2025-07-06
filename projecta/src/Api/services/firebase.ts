import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
// }


//Coloquei aqui propositalmente. Para fins de teste, use as credenciais abaixo - Mário Salvador
const firebaseConfig = {
  apiKey: "AIzaSyAEVyl8l6YH_-z1jp_04EUOwxSDpTJxGuo",
  authDomain: "teste-a0a09.firebaseapp.com",
  projectId: "teste-a0a09",
  storageBucket: "teste-a0a09.firebasestorage.app",
  messagingSenderId: "1077835459993",
  appId: "1:1077835459993:web:171f1f4862bcfefc1c3708",
  measurementId: "G-EHRGPY7TMN"
};


const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)