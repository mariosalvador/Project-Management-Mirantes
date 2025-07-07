import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectByTitle,
  CreateProjectData
} from '@/Api/services/projects'
import { Project } from '@/types/project'
import { toast } from 'sonner'

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  createNewProject: (data: CreateProjectData) => Promise<string | null>
  loadProjects: () => Promise<void>
  updateProjectData: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProjectData: (projectId: string) => Promise<void>
  refreshProject: (projectId: string) => Promise<Project | null>
}

export const useProjects = (): UseProjectsReturn => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar projetos do usuário
  const loadProjects = useCallback(async () => {

    if (!user?.uid) {
      setProjects([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
      setError(null) // Limpar erro em caso de sucesso
    } catch (err) {
      console.error('useProjects: Erro ao carregar projetos:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar projetos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Criar novo projeto
  const createNewProject = async (data: CreateProjectData): Promise<string | null> => {
    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const projectId = await createProject(data, user.uid)
      toast.success('Projeto criado com sucesso!')

      // Recarregar projetos para incluir o novo
      await loadProjects()

      return projectId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar projeto'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Atualizar projeto
  const updateProjectData = async (projectId: string, updates: Partial<Project>): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await updateProject(projectId, updates)

      // Atualizar estado local
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, ...updates }
            : project
        )
      )

      toast.success('Projeto atualizado com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Deletar projeto
  const deleteProjectData = async (projectId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await deleteProject(projectId)

      // Remover do estado local
      setProjects(prev => prev.filter(project => project.id !== projectId))

      toast.success('Projeto removido com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover projeto'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar um projeto específico
  const refreshProject = async (projectId: string): Promise<Project | null> => {
    try {
      const project = await getProject(projectId)

      if (project) {
        setProjects(prev =>
          prev.map(p => p.id === projectId ? project : p)
        )
      }

      return project
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }

  // Carregar projetos quando o usuário muda
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    createNewProject,
    loadProjects,
    updateProjectData,
    deleteProjectData,
    refreshProject
  }
}

// Hook para um projeto específico
interface UseProjectReturn {
  project: Project | null
  loading: boolean
  error: string | null
  updateProject: (updates: Partial<Project>) => Promise<void>
  refreshProject: () => Promise<void>
}

export const useProject = (projectId: string): UseProjectReturn => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar projeto específico
  const loadProject = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const projectData = await getProject(projectId)
      setProject(projectData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar projeto'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Atualizar projeto
  const updateProjectData = async (updates: Partial<Project>): Promise<void> => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      await updateProject(projectId, updates)

      // Atualizar estado local
      setProject(prev => prev ? { ...prev, ...updates } : null)

      toast.success('Projeto atualizado com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Recarregar projeto
  const refreshProject = async (): Promise<void> => {
    await loadProject()
  }

  // Carregar projeto quando o ID muda
  useEffect(() => {
    loadProject()
  }, [loadProject])

  return {
    project,
    loading,
    error,
    updateProject: updateProjectData,
    refreshProject
  }
}

// Hook para buscar projeto por título
interface UseProjectByTitleReturn {
  project: Project | null
  loading: boolean
  error: string | null
  refreshProject: () => Promise<void>
}

export const useProjectByTitle = (title: string): UseProjectByTitleReturn => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar projeto por título
  const loadProject = useCallback(async () => {
    if (!title) return

    setLoading(true)
    setError(null)

    try {
      const projectData = await getProjectByTitle(title)
      setProject(projectData)

      if (!projectData) {
        setError("Projeto não encontrado")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar projeto'
      setError(errorMessage)
      console.error('useProjectByTitle: Erro ao carregar projeto:', err)
    } finally {
      setLoading(false)
    }
  }, [title])

  // Atualizar projeto
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateProjectData = async (updates: Partial<Project>): Promise<void> => {
    if (!project?.id) return

    try {
      await updateProject(project.id, updates)

      // Atualizar estado local
      setProject(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      setError(errorMessage)
      console.error('useProjectByTitle: Erro ao atualizar projeto:', err)
    }
  }

  // Recarregar projeto
  const refreshProject = async (): Promise<void> => {
    await loadProject()
  }

  // Carregar projeto quando o título muda
  useEffect(() => {
    loadProject()
  }, [loadProject])

  return {
    project,
    loading,
    error,
    refreshProject
  }
}
