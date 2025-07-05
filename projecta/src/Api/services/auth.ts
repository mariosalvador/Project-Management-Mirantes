import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "./firebase"

// Provedor do Google
const googleProvider = new GoogleAuthProvider()

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider)
  return userCredential.user
}
