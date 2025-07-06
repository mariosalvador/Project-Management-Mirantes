import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import { checkPendingInvitesOnLogin } from "./invites"

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
      provider,
      role: 'admin', // Todo usuário que cria um projeto se torna admin automaticamente
      permissions: {
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canManageTeam: true,
        canManageTasks: true,
        canViewAnalytics: true,
        isAdmin: true
      }
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

  // Verificar convites pendentes após criar conta
  await checkPendingInvitesOnLogin(email, userCredential.user.uid)

  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  await saveUserToFirestore(userCredential.user, 'email')

  // Verificar convites pendentes após login
  await checkPendingInvitesOnLogin(email, userCredential.user.uid)

  return userCredential.user
}

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider)
  await saveUserToFirestore(userCredential.user, 'google')

  // Verificar convites pendentes após login
  if (userCredential.user.email) {
    await checkPendingInvitesOnLogin(userCredential.user.email, userCredential.user.uid)
  }

  return userCredential.user
}

// Função para buscar informações do usuário por UID
export const getUserInfo = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data()
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
    return null
  }
}
