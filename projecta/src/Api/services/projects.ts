import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"
import { Project, TeamMember, Task, Milestone } from "@/types/project"
import { notifyTaskStatusChange, notifyProjectUpdate, notifyTaskAssignment } from "./notifications"

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
  createdAt: unknown
  updatedAt: unknown
  isArchived?: boolean
}

// Criar um novo projeto
export const createProject = async (
  projectData: CreateProjectData,
  userId: string
): Promise<string> => {
  try {
    const now = serverTimestamp()

    // Se team estiver vazio, adicionar dados de teste
    const teamToSave = projectData.team.length > 0 ? projectData.team : [
      {
        id: "test-user-1",
        name: "Usuário de Teste",
        role: "developer",
        avatar: "UT"
      }
    ];

    const newProject: Omit<ProjectWithFirebaseData, 'id'> = {
      ...projectData,
      team: teamToSave,
      progress: 0,
      teamMembers: teamToSave.length,
      tasksCompleted: 0,
      totalTasks: projectData.tasks.length,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      isArchived: false
    }

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject)

    // Notificar membros da equipe sobre o novo projeto (exceto o criador)
    try {
      const teamMemberIds = teamToSave
        .filter(member => member.id !== userId)
        .map(member => member.id);

      if (teamMemberIds.length > 0) {
        await notifyProjectUpdate(
          docRef.id,
          projectData.title,
          "criação",
          `O projeto "${projectData.title}" foi criado e você foi adicionado à equipe.`,
          userId,
          teamMemberIds
        );

      }  
      for (const task of projectData.tasks) {
        if (task.assignees && task.assignees.length > 0) {
          const assigneeIds = task.assignees; 
          await notifyTaskAssignment(
            task.id,
            task.title,
            docRef.id,
            projectData.title,
            userId,
            assigneeIds
          );
        }
      }
    } catch (notificationError) {
      console.error("Erro ao enviar notificações de criação de projeto:", notificationError);
    }

    return docRef.id
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    throw new Error("Falha ao criar projeto")
  }
}

// Buscar todos os projetos do usuário (criados por ele ou onde ele é membro da equipe)
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const createdByUserQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where("createdBy", "==", userId)
    )

    const createdByUserSnapshot = await getDocs(createdByUserQuery)

    const createdProjects: Project[] = []

    createdByUserSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (!data.isArchived) {
        createdProjects.push({
          id: doc.id,
          ...data
        } as Project)
      }
    })

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
      const projectData = docSnap.data()

      if (projectData.isArchived) {
        return null
      }

      return {
        id: docSnap.id,
        ...projectData
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
    const projectQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where("title", "==", title),
      where("isArchived", "==", false)
    )
    const querySnapshot = await getDocs(projectQuery)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const project = {
      id: doc.id,
      ...doc.data()
    } as Project

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
    // Verificar se o projeto existe antes de tentar deletar
    const projectExists = await getDoc(doc(db, PROJECTS_COLLECTION, projectId))
    if (!projectExists.exists()) {
      throw new Error("Projeto não encontrado")
    }

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

// Deletar um projeto permanentemente (hard delete) - usar com cuidado
export const deleteProjectPermanently = async (projectId: string): Promise<void> => {
  try {

    // Verificar se o projeto existe antes de tentar deletar
    const projectExists = await getDoc(doc(db, PROJECTS_COLLECTION, projectId))
    if (!projectExists.exists()) {
      throw new Error("Projeto não encontrado")
    }

    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await deleteDoc(docRef)

  } catch (error) {
    console.error("Erro ao deletar projeto permanentemente:", error)
    throw new Error("Falha ao deletar projeto permanentemente")
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

// Buscar todos os projetos onde o usuário é membro da equipe (criados por ele ou onde está na equipe)
export const getUserProjectsAsMember = async (userEmail: string, userName?: string): Promise<Project[]> => {
  try {
    const allProjectsQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where("isArchived", "==", false)
    )

    const querySnapshot = await getDocs(allProjectsQuery)
    const memberProjects: Project[] = []

    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      const project = {
        id: doc.id,
        ...data
      } as Project

      // Verificar se o usuário está na equipe do projeto
      if (project.team && Array.isArray(project.team)) {
        const isMember = project.team.some(member => {
          // Verificar por email (se disponível no team)
          if (member.email && member.email.toLowerCase() === userEmail.toLowerCase()) {
            return true;
          }

          // Verificar por nome (fallback)
          if (userName && member.name && member.name.toLowerCase() === userName.toLowerCase()) {
            console.log("Usuário encontrado no projeto por nome:", project.title);
            return true;
          }

          return false;
        });

        if (isMember) {
          memberProjects.push(project);
        }
      }
    })
    return memberProjects
  } catch (error) {
    console.error("getUserProjectsAsMember: Erro detalhado:", error)
    throw new Error("Falha ao buscar projetos como membro")
  }
}

// Atualizar status de uma tarefa específica em um projeto
export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  newStatus: Task['status'],
  changedBy?: string
): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
    const projectSnap = await getDoc(projectRef)

    if (!projectSnap.exists()) {
      throw new Error("Projeto não encontrado")
    }

    const projectData = projectSnap.data() as Project

    if (!projectData.tasks || !Array.isArray(projectData.tasks)) {
      throw new Error("Projeto não possui tarefas")
    }

    // Encontrar a tarefa original para capturar o status anterior
    const originalTask = projectData.tasks.find(task => task.id === taskId)
    if (!originalTask) {
      throw new Error("Tarefa não encontrada")
    }

    const oldStatus = originalTask.status

    // Encontrar e atualizar a tarefa
    const updatedTasks = projectData.tasks.map(task => {
      if (task.id === taskId) {
        console.log("Tarefa encontrada, atualizando status de", task.status, "para", newStatus);
        return { ...task, status: newStatus }
      }
      return task
    })

    // Calcular estatísticas atualizadas
    const completedTasks = updatedTasks.filter(task => task.status === 'completed').length
    const totalTasks = updatedTasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Atualizar o projeto no Firestore
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      tasksCompleted: completedTasks,
      totalTasks: totalTasks,
      progress: progress,
      updatedAt: serverTimestamp()
    })

    // Enviar notificações se houver mudança real de status
    if (oldStatus !== newStatus && changedBy) {
      try {
        // Obter IDs dos membros da equipe
        const teamMemberIds = projectData.team?.map((member: TeamMember) => member.id) || []

        // Obter IDs dos assignees da tarefa
        const taskAssigneeIds = originalTask.assignees || []

        await notifyTaskStatusChange(
          taskId,
          originalTask.title,
          projectId,
          projectData.title,
          oldStatus,
          newStatus,
          changedBy,
          teamMemberIds,
          taskAssigneeIds
        )

      } catch (notificationError) {
        console.error("Erro ao enviar notificações:", notificationError);
        // Não falhar a operação principal por causa das notificações
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error)
    throw new Error("Falha ao atualizar status da tarefa")
  }
}

// Deletar uma tarefa específica de um projeto
export const deleteTask = async (
  projectId: string,
  taskId: string,
  deletedBy?: string
): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
    const projectSnap = await getDoc(projectRef)

    if (!projectSnap.exists()) {
      throw new Error("Projeto não encontrado")
    }

    const projectData = projectSnap.data() as Project

    if (!projectData.tasks || !Array.isArray(projectData.tasks)) {
      throw new Error("Projeto não possui tarefas")
    }

    // Encontrar a tarefa a ser deletada
    const taskToDelete = projectData.tasks.find(task => task.id === taskId)
    if (!taskToDelete) {
      throw new Error("Tarefa não encontrada")
    }

    // Remover a tarefa do array
    const updatedTasks = projectData.tasks.filter(task => task.id !== taskId)

    // Calcular estatísticas atualizadas
    const completedTasks = updatedTasks.filter(task => task.status === 'completed').length
    const totalTasks = updatedTasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Atualizar o projeto no Firestore
    await updateDoc(projectRef, {
      tasks: updatedTasks,
      tasksCompleted: completedTasks,
      totalTasks: totalTasks,
      progress: progress,
      updatedAt: serverTimestamp()
    })

    // Enviar notificação sobre a exclusão da tarefa
    if (deletedBy) {
      try {
        // Obter IDs dos membros da equipe
        const teamMemberIds = projectData.team?.map((member: TeamMember) => member.id) || []

        // Obter IDs dos assignees da tarefa deletada
        const taskAssigneeIds = taskToDelete.assignees || []

        // Combinar membros e assignees, removendo duplicatas e o usuário que deletou
        const usersToNotify = [...new Set([...teamMemberIds, ...taskAssigneeIds])]
          .filter(userId => userId !== deletedBy)

        if (usersToNotify.length > 0) {
          await notifyProjectUpdate(
            projectId,
            projectData.title,
            "exclusão de tarefa",
            `A tarefa "${taskToDelete.title}" foi removida do projeto.`,
            deletedBy,
            usersToNotify
          )

          console.log(`Notificações de exclusão de tarefa enviadas para ${usersToNotify.length} usuários`);
        }
      } catch (notificationError) {
        console.error("Erro ao enviar notificações de exclusão:", notificationError);
      }
    }
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error)
    throw new Error("Falha ao deletar tarefa")
  }
}
