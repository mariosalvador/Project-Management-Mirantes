import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

const googleProvider = new GoogleAuthProvider()

const saveUserToFirestore = async (user: User, provider: 'email' | 'google') => {
  try {
    const userRef = doc(db, 'users', user.uid)
    const now = new Date()

    const baseData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastLoginAt: now.toISOString(),
      provider
    }

    const userData = provider === 'email'
      ? { ...baseData, createdAt: now.toISOString() }
      : baseData

    await setDoc(userRef, userData, { merge: true })
  } catch (error) {
    console.error('Erro ao salvar usuário no Firestore:', error)
    throw error
  }
}

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await saveUserToFirestore(userCredential.user, 'email')
  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  await saveUserToFirestore(userCredential.user, 'email')
  return userCredential.user
}

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider)
  await saveUserToFirestore(userCredential.user, 'google')
  return userCredential.user
}
