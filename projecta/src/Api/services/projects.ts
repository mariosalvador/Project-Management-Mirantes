import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"
import { Project, TeamMember, Task, Milestone } from "@/types/project"

const PROJECTS_COLLECTION = "projects"

export interface CreateProjectData {
  title: string
  description: string
  status: Project['status']
  priority: Project['priority']
  category: string
  manager: string
  startDate: string
  dueDate: string
  budget: string
  team: TeamMember[]
  tasks: Task[]
  milestones: Milestone[]
}

export interface ProjectWithFirebaseData {
  title: string
  description: string
  status: Project['status']
  priority: Project['priority']
  category: string
  manager: string
  startDate: string
  dueDate: string
  budget: string
  team: TeamMember[]
  tasks: Task[]
  milestones: Milestone[]
  progress?: number
  teamMembers?: number
  tasksCompleted?: number
  totalTasks?: number
  createdBy: string
  createdAt: unknown // Firebase Timestamp or FieldValue
  updatedAt: unknown // Firebase Timestamp or FieldValue
  isArchived?: boolean
}

// Criar um novo projeto
export const createProject = async (
  projectData: CreateProjectData,
  userId: string
): Promise<string> => {
  try {
    const now = serverTimestamp()

    const newProject: Omit<ProjectWithFirebaseData, 'id'> = {
      ...projectData,
      progress: 0,
      teamMembers: projectData.team.length,
      tasksCompleted: 0,
      totalTasks: projectData.tasks.length,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      isArchived: false
    }

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject)
    return docRef.id
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    throw new Error("Falha ao criar projeto")
  }
}

// Buscar todos os projetos do usuário (criados por ele ou onde ele é membro da equipe)
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    console.log('getUserProjects: Iniciando busca para usuário:', userId)

    // Buscar projetos criados pelo usuário (query simplificada)
    const createdByUserQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where("createdBy", "==", userId)
    )

    console.log('getUserProjects: Executando query para projetos criados pelo usuário')
    const createdByUserSnapshot = await getDocs(createdByUserQuery)

    const createdProjects: Project[] = []

    createdByUserSnapshot.docs.forEach(doc => {
      const data = doc.data()
      // Apenas incluir projetos não arquivados
      if (!data.isArchived) {
        createdProjects.push({
          id: doc.id,
          ...data
        } as Project)
      }
    })

    console.log('getUserProjects: Projetos criados encontrados:', createdProjects.length)

    return createdProjects
  } catch (error) {
    console.error("getUserProjects: Erro detalhado:", error)
    throw new Error("Falha ao buscar projetos")
  }
}

// Buscar um projeto específico
export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Project
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar projeto:", error)
    throw new Error("Falha ao buscar projeto")
  }
}

// Buscar projeto por título
export const getProjectByTitle = async (title: string): Promise<Project | null> => {
  try {
    console.log('getProjectByTitle: Buscando projeto com título:', title)

    const projectQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where("title", "==", title)
    )

    const querySnapshot = await getDocs(projectQuery)

    if (querySnapshot.empty) {
      console.log('getProjectByTitle: Nenhum projeto encontrado com o título:', title)
      return null
    }

    // Pegar o primeiro projeto encontrado (títulos devem ser únicos)
    const doc = querySnapshot.docs[0]
    const project = {
      id: doc.id,
      ...doc.data()
    } as Project

    console.log('getProjectByTitle: Projeto encontrado:', project.id)
    return project
  } catch (error) {
    console.error("getProjectByTitle: Erro ao buscar projeto por título:", error)
    throw new Error("Falha ao buscar projeto")
  }
}

// Atualizar um projeto
export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    throw new Error("Falha ao atualizar projeto")
  }
}

// Deletar um projeto (soft delete)
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await updateDoc(docRef, {
      isArchived: true,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error("Erro ao deletar projeto:", error)
    throw new Error("Falha ao deletar projeto")
  }
}

// Atualizar progresso do projeto baseado nas tarefas
export const updateProjectProgress = async (projectId: string): Promise<void> => {
  try {
    const project = await getProject(projectId)
    if (!project || !project.tasks) return

    const completedTasks = project.tasks.filter(task => task.status === 'completed').length
    const totalTasks = project.tasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    await updateProject(projectId, {
      progress,
      tasksCompleted: completedTasks,
      totalTasks
    })
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error)
    throw new Error("Falha ao atualizar progresso")
  }
}

// Adicionar membro à equipe
export const addTeamMember = async (
  projectId: string,
  member: TeamMember
): Promise<void> => {
  try {
    const project = await getProject(projectId)
    if (!project) throw new Error("Projeto não encontrado")

    const updatedTeam = [...(project.team || []), member]

    await updateProject(projectId, {
      team: updatedTeam,
      teamMembers: updatedTeam.length
    })
  } catch (error) {
    console.error("Erro ao adicionar membro:", error)
    throw new Error("Falha ao adicionar membro")
  }
}

// Remover membro da equipe
export const removeTeamMember = async (
  projectId: string,
  memberId: string
): Promise<void> => {
  try {
    const project = await getProject(projectId)
    if (!project) throw new Error("Projeto não encontrado")

    const updatedTeam = (project.team || []).filter(member => member.id !== memberId)

    await updateProject(projectId, {
      team: updatedTeam,
      teamMembers: updatedTeam.length
    })
  } catch (error) {
    console.error("Erro ao remover membro:", error)
    throw new Error("Falha ao remover membro")
  }
}

// Adicionar tarefa
export const addTask = async (
  projectId: string,
  task: Task
): Promise<void> => {
  try {
    const project = await getProject(projectId)
    if (!project) throw new Error("Projeto não encontrado")

    const updatedTasks = [...(project.tasks || []), task]

    await updateProject(projectId, {
      tasks: updatedTasks,
      totalTasks: updatedTasks.length
    })

    // Atualizar progresso
    await updateProjectProgress(projectId)
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error)
    throw new Error("Falha ao adicionar tarefa")
  }
}

// Atualizar status da tarefa
export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  status: Task['status']
): Promise<void> => {
  try {
    const project = await getProject(projectId)
    if (!project) throw new Error("Projeto não encontrado")

    const updatedTasks = (project.tasks || []).map(task =>
      task.id === taskId ? { ...task, status } : task
    )

    await updateProject(projectId, {
      tasks: updatedTasks
    })

    // Atualizar progresso
    await updateProjectProgress(projectId)
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    throw new Error("Falha ao atualizar tarefa")
  }
}
