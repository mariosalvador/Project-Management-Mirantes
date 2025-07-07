"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/Api/services/firebase'
import { setAuthCookie, clearAuthCookies } from '@/utils/auth-cookies'

interface UserData {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  lastLoginAt: Date
  provider: 'email' | 'google'
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        const userData: UserData = {
          uid: user.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: new Date(data.createdAt),
          lastLoginAt: new Date(data.lastLoginAt),
          provider: data.provider
        }
        setUserData(userData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
      clearAuthCookies()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        await loadUserData(user)
        setAuthCookie(user)
      } else {
        setUserData(null)
        clearAuthCookies()
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSaveUser = () => {
  const saveUserToFirestore = async (user: User, provider: 'email' | 'google') => {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      const now = new Date()

      if (!userSnap.exists()) {
        // Usuário novo
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: now.toISOString(),
          lastLoginAt: now.toISOString(),
          provider
        })
      } else {
        await setDoc(userRef, {
          lastLoginAt: now.toISOString(),
          // Atualizar dados se vieram do provider
          ...(user.displayName && { displayName: user.displayName }),
          ...(user.photoURL && { photoURL: user.photoURL })
        }, { merge: true })
      }
    } catch (error) {
      console.error('Erro ao salvar usuário no Firestore:', error)
      throw error
    }
  }

  return { saveUserToFirestore }
}
