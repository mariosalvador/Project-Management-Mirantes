import { User } from 'firebase/auth'

// Constantes para cookies
const AUTH_TOKEN_KEY = 'auth-token'
const USER_DATA_KEY = 'user-data'

/**
 * Define um cookie de autenticação
 */
export const setAuthCookie = (user: User) => {
  try {
    // Usar o UID do usuário como token de identificação
    const token = user.uid
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }

    // Definir cookies com expiração de 7 dias
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    document.cookie = `${AUTH_TOKEN_KEY}=${token}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
    document.cookie = `${USER_DATA_KEY}=${encodeURIComponent(JSON.stringify(userData))}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
  } catch (error) {
    console.error('Erro ao definir cookies de autenticação:', error)
  }
}

/**
 * Remove os cookies de autenticação
 */
export const clearAuthCookies = () => {
  try {
    document.cookie = `${AUTH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${USER_DATA_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  } catch (error) {
    console.error('Erro ao limpar cookies de autenticação:', error)
  }
}

/**
 * Obtém o token de autenticação do cookie (client-side)
 */
export const getAuthToken = (): string | null => {
  try {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${AUTH_TOKEN_KEY}=`)
    )

    return authCookie ? authCookie.split('=')[1] : null
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error)
    return null
  }
}

/**
 * Obtém os dados do usuário do cookie 
 */
export const getUserDataFromCookie = (): { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null => {
  try {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const userDataCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${USER_DATA_KEY}=`)
    )

    if (userDataCookie) {
      const userData = decodeURIComponent(userDataCookie.split('=')[1])
      return JSON.parse(userData)
    }

    return null
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error)
    return null
  }
}
