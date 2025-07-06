import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth"
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore"
import { auth, db } from "./firebase"
import { checkPendingInvitesOnLogin } from "./invites"

const googleProvider = new GoogleAuthProvider()

// Função para verificar se um email já está registrado
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return false
  }
}

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
      role: 'admin', 
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
  try {
    // Verificar se email já está registrado
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Marcar como novo usuário
    await saveUserToFirestore(userCredential.user, 'email', true)

    return userCredential.user
  } catch (error: unknown) {
    // Se for erro do Firebase sobre email já existir
    const firebaseError = error as { code?: string }
    if (firebaseError.code === 'auth/email-already-in-use') {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }
    // Re-throw outros erros
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    // Usuário existente fazendo login
    await saveUserToFirestore(userCredential.user, 'email', false)

    return userCredential.user
  } catch (error: unknown) {
    // Melhorar as mensagens de erro
    const firebaseError = error as { code?: string }
    if (firebaseError.code === 'auth/user-not-found') {
      throw new Error('USER_NOT_FOUND')
    } else if (firebaseError.code === 'auth/wrong-password') {
      throw new Error('WRONG_PASSWORD')
    } else if (firebaseError.code === 'auth/invalid-email') {
      throw new Error('INVALID_EMAIL')
    } else if (firebaseError.code === 'auth/user-disabled') {
      throw new Error('USER_DISABLED')
    } else if (firebaseError.code === 'auth/too-many-requests') {
      throw new Error('TOO_MANY_REQUESTS')
    }
    // Re-throw outros erros
    throw error
  }
}

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)

    // Verificar se é um usuário novo ou existente
    const userRef = doc(db, 'users', userCredential.user.uid)
    const userSnap = await getDoc(userRef)
    const isNewUser = !userSnap.exists()

    // Se for novo usuário, verificar se email já está sendo usado por outro método
    if (isNewUser && userCredential.user.email) {
      const emailExists = await checkEmailExists(userCredential.user.email)
      if (emailExists) {
      }
    }

    await saveUserToFirestore(userCredential.user, 'google', isNewUser)

    return userCredential.user
  } catch (error: unknown) {
    const firebaseError = error as { code?: string }
    if (firebaseError.code === 'auth/popup-closed-by-user') {
      throw new Error('POPUP_CLOSED')
    } else if (firebaseError.code === 'auth/popup-blocked') {
      throw new Error('POPUP_BLOCKED')
    } else if (firebaseError.code === 'auth/cancelled-popup-request') {
      throw new Error('POPUP_CANCELLED')
    }
    throw error
  }
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

// Função para verificar se um usuário existe por email (útil para formulários)
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    return await checkEmailExists(email)
  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return false
  }
}
