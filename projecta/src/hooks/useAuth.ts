import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signInWithGoogle, signUp, checkUserExists } from "@/Api/services/auth"
import {
  validateLoginForm,
  validateRegistrationForm,
  validateEmail,
  handleFirebaseAuthError,
  handleGoogleSignInError,
  getSuccessMessage
} from "@/utils/authValidation"

export interface UseAuthReturn {
  // Estados
  isLoading: boolean
  error: string
  success: string

  handleLogin: (email: string, password: string) => Promise<void>
  handleGoogleLogin: () => Promise<void>

  handleRegister: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>

  // Funções utilitárias
  checkEmailExists: (email: string) => Promise<boolean>
  clearMessages: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    clearMessages()

    const validation = validateLoginForm(email, password)
    if (!validation.isValid) {
      setError(validation.error || "Dados inválidos")
      setIsLoading(false)
      return
    }

    try {
      const user = await signIn(email, password)

      if (user) {
        setSuccess(getSuccessMessage('login'))
        router.push('/apk')
      }
    } catch (err: unknown) {
      console.error("Login error:", err)
      const errorMessage = handleFirebaseAuthError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    clearMessages()

    try {
      const user = await signInWithGoogle()

      if (user) {
        setSuccess(getSuccessMessage('login'))
        router.push('/apk')
      }
    } catch (err: unknown) {
      console.error("Google login error:", err)
      const errorMessage = handleGoogleSignInError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setIsLoading(true)
    clearMessages()

    // Validar todos os campos do formulário
    const validation = validateRegistrationForm(name, email, password, confirmPassword)
    if (!validation.isValid) {
      setError(validation.error || "Dados inválidos")
      setIsLoading(false)
      return
    }

    try {
      const user = await signUp(email, password)

      if (user) {
        const successMessage = getSuccessMessage('register')
        setSuccess(successMessage)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (err: unknown) {
      console.error("Registration error:", err)
      const errorMessage = handleFirebaseAuthError(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailExists = async (email: string): Promise<boolean> => {
    // Primeiro, validar formato do email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return false
    }

    try {
      return await checkUserExists(email)
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      return false
    }
  }

  return {
    isLoading,
    error,
    success,
    handleLogin,
    handleGoogleLogin,
    handleRegister,
    checkEmailExists,
    clearMessages
  }
}
