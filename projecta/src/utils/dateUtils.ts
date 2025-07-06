/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipos para datas do Firestore
type FirestoreTimestamp = {
  toDate(): Date
  seconds: number
  nanoseconds: number
}

type FirestoreDate = FirestoreTimestamp | { seconds: number } | string | Date | null | undefined

// Função para formatar data do Firestore
export const formatFirestoreDate = (firestoreDate: FirestoreDate): string => {
  try {
    // Se é um Firestore Timestamp
    if (firestoreDate && typeof (firestoreDate as any).toDate === 'function') {
      return (firestoreDate as FirestoreTimestamp).toDate().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Se é um Firestore Timestamp serializado (com seconds e nanoseconds)
    if (firestoreDate && typeof firestoreDate === 'object' && 'seconds' in firestoreDate) {
      const date = new Date(firestoreDate.seconds * 1000)
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Se é uma string ISO
    if (typeof firestoreDate === 'string') {
      const date = new Date(firestoreDate)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }

    // Se é um objeto Date
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return 'Data não disponível'
  } catch (error) {
    console.error('Erro ao formatar data:', error, firestoreDate)
    return 'Data inválida'
  }
}

// Função mais simples para data apenas (sem hora)
export const formatFirestoreDateSimple = (firestoreDate: FirestoreDate): string => {
  try {
    // Se é um Firestore Timestamp
    if (firestoreDate && typeof (firestoreDate as any).toDate === 'function') {
      return (firestoreDate as FirestoreTimestamp).toDate().toLocaleDateString('pt-BR')
    }

    // Se é um Firestore Timestamp serializado
    if (firestoreDate && typeof firestoreDate === 'object' && 'seconds' in firestoreDate) {
      const date = new Date(firestoreDate.seconds * 1000)
      return date.toLocaleDateString('pt-BR')
    }

    // Se é uma string ISO
    if (typeof firestoreDate === 'string') {
      const date = new Date(firestoreDate)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR')
      }
    }

    // Se é um objeto Date
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString('pt-BR')
    }

    return 'Data não disponível'
  } catch (error) {
    console.error('Erro ao formatar data:', error, firestoreDate)
    return 'Data inválida'
  }
}

// Função para verificar se uma data é válida
export const isValidDate = (date: FirestoreDate): boolean => {
  try {
    if (date && typeof (date as any).toDate === 'function') {
      return !isNaN((date as FirestoreTimestamp).toDate().getTime())
    }

    if (date && typeof date === 'object' && 'seconds' in date) {
      return !isNaN(new Date(date.seconds * 1000).getTime())
    }

    if (typeof date === 'string') {
      return !isNaN(new Date(date).getTime())
    }

    if (date instanceof Date) {
      return !isNaN(date.getTime())
    }

    return false
  } catch {
    return false
  }
}
