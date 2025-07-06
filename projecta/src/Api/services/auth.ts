import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import { checkPendingInvitesOnLogin } from "./invites"

const googleProvider = new GoogleAuthProvider()

const saveUserToFirestore = async (user: User, provider: 'email' | 'google', isNewUser: boolean = false) => {
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

    const userData = (provider === 'email' && isNewUser)
      ? { ...baseData, createdAt: now.toISOString() }
      : baseData

    await setDoc(userRef, userData, { merge: true })

    // Verificar convites pendentes após salvar usuário
    if (user.email) {
      await checkPendingInvitesOnLogin(user.email, user.uid, isNewUser)
    }
  } catch (error) {
    console.error('Erro ao salvar usuário no Firestore:', error)
    throw error
  }
}

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  // Marcar como novo usuário
  await saveUserToFirestore(userCredential.user, 'email', true)

  return userCredential.user
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  // Usuário existente fazendo login
  await saveUserToFirestore(userCredential.user, 'email', false)

  return userCredential.user
}

export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider)

  // Verificar se é um usuário novo ou existente
  const userRef = doc(db, 'users', userCredential.user.uid)
  const userSnap = await getDoc(userRef)
  const isNewUser = !userSnap.exists()

  await saveUserToFirestore(userCredential.user, 'google', isNewUser)

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
