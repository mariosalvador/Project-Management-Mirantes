import { useState, useEffect } from 'react'
import { getUserInfo } from '@/Api/services/auth'

interface UserInfo {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: string
  createdAt?: string
}

// Hook para buscar informações de um usuário específico por UID
export const useUserInfo = (uid: string | null) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!uid) {
        setUserInfo(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const userData = await getUserInfo(uid)
        setUserInfo(userData as UserInfo)
      } catch (err) {
        console.error('Erro ao buscar informações do usuário:', err)
        setError('Erro ao carregar informações do usuário')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [uid])

  return { userInfo, loading, error }
}

// Hook para buscar informações de múltiplos usuários
export const useUsersInfo = (uids: string[]) => {
  const [usersInfo, setUsersInfo] = useState<Record<string, UserInfo>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsersInfo = async () => {
      if (uids.length === 0) {
        setUsersInfo({})
        return
      }

      setLoading(true)
      setError(null)

      try {
        const usersData: Record<string, UserInfo> = {}

        // Buscar informações de cada usuário
        await Promise.all(
          uids.map(async (uid) => {
            const userData = await getUserInfo(uid)
            if (userData) {
              usersData[uid] = userData as UserInfo
            }
          })
        )

        setUsersInfo(usersData)
      } catch (err) {
        console.error('Erro ao buscar informações dos usuários:', err)
        setError('Erro ao carregar informações dos usuários')
      } finally {
        setLoading(false)
      }
    }

    fetchUsersInfo()
  }, [uids])

  return { usersInfo, loading, error }
}
