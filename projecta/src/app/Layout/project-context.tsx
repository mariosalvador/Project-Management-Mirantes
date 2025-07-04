"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"


export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface Comment {
  id: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: "planning" | "active" | "completed" | "on-hold"
  startDate: string
  endDate: string
  members: string[]
  tasks: Task[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  projects: Project[]
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (projectId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  addComment: (projectId: string, taskId: string, comment: Omit<Comment, "id" | "createdAt">) => void
  reorderTasks: (projectId: string, tasks: Task[]) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])


  useEffect(() => {
    // Verifica se já existem dados no localStorage
    const savedProjects = localStorage.getItem("projects")
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (error) {
        console.error("Erro ao carregar projetos do localStorage:", error)
        // Se houver erro, usa dados de exemplo
        setProjects(getSampleProjects())
      }
    } else {
      // Se não há dados salvos, usa dados de exemplo
      setProjects(getSampleProjects())
    }
  }, [])

  const getSampleProjects = (): Project[] => [
    {
      id: "1",
      title: "Website Redesign",
      description: "Redesign completo do website corporativo com nova identidade visual e melhor experiência do usuário",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      members: ["user1", "user2", "user3"],
      tasks: [
        {
          id: "1",
          title: "Análise de Requisitos",
          description: "Levantar todos os requisitos do projeto e definir escopo",
          status: "completed",
          priority: "high",
          assignedTo: "user1",
          dueDate: "2024-01-15",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-10T00:00:00Z",
          comments: [],
        },
        {
          id: "2",
          title: "Design UI/UX",
          description: "Criar mockups e protótipos interativos",
          status: "in-progress",
          priority: "high",
          assignedTo: "user2",
          dueDate: "2024-02-15",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-20T00:00:00Z",
          comments: [],
        },
        {
          id: "3",
          title: "Desenvolvimento Frontend",
          description: "Implementar as telas conforme design aprovado",
          status: "todo",
          priority: "medium",
          assignedTo: "user3",
          dueDate: "2024-03-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          comments: [],
        },
      ],
      createdBy: "user1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-20T00:00:00Z",
    },
    {
      id: "2",
      title: "Sistema de Gestão",
      description: "Desenvolvimento de sistema interno para gestão de projetos e tarefas",
      status: "planning",
      startDate: "2024-02-01",
      endDate: "2024-06-30",
      members: ["user1", "user4"],
      tasks: [
        {
          id: "4",
          title: "Levantamento de Requisitos",
          description: "Definir funcionalidades do sistema",
          status: "todo",
          priority: "high",
          assignedTo: "user1",
          dueDate: "2024-02-15",
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
          comments: [],
        },
      ],
      createdBy: "user1",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      title: "App Mobile",
      description: "Aplicativo mobile para acompanhamento de projetos",
      status: "completed",
      startDate: "2023-10-01",
      endDate: "2023-12-31",
      members: ["user2", "user3"],
      tasks: [
        {
          id: "5",
          title: "Design do App",
          description: "Criar interface do aplicativo",
          status: "completed",
          priority: "high",
          assignedTo: "user2",
          dueDate: "2023-11-15",
          createdAt: "2023-10-01T00:00:00Z",
          updatedAt: "2023-11-10T00:00:00Z",
          comments: [],
        },
        {
          id: "6",
          title: "Desenvolvimento",
          description: "Implementar funcionalidades do app",
          status: "completed",
          priority: "high",
          assignedTo: "user3",
          dueDate: "2023-12-20",
          createdAt: "2023-10-01T00:00:00Z",
          updatedAt: "2023-12-18T00:00:00Z",
          comments: [],
        },
      ],
      createdBy: "user2",
      createdAt: "2023-10-01T00:00:00Z",
      updatedAt: "2023-12-31T00:00:00Z",
    },
    {
      id: "4",
      title: "Integração API",
      description: "Integração com APIs externas para sincronização de dados",
      status: "on-hold",
      startDate: "2024-01-15",
      endDate: "2024-04-15",
      members: ["user4"],
      tasks: [
        {
          id: "7",
          title: "Análise de APIs",
          description: "Estudar documentação das APIs",
          status: "completed",
          priority: "medium",
          assignedTo: "user4",
          dueDate: "2024-02-01",
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-30T00:00:00Z",
          comments: [],
        },
        {
          id: "8",
          title: "Implementação",
          description: "Desenvolver integrações",
          status: "todo",
          priority: "medium",
          assignedTo: "user4",
          dueDate: "2024-03-15",
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
          comments: [],
        },
      ],
      createdBy: "user4",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-30T00:00:00Z",
    },
  ]

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects)
    localStorage.setItem("projects", JSON.stringify(newProjects))
  }

  const createProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newProjects = [...projects, newProject]
    saveProjects(newProjects)

    toast("Projeto criado com sucesso!", {})
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    const newProjects = projects.map((project) =>
      project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project,
    )
    saveProjects(newProjects)

    toast("Projeto atualizado com sucesso!", {})
  }

  const deleteProject = (id: string) => {
    const newProjects = projects.filter((project) => project.id !== id)
    saveProjects(newProjects)

    toast("Projeto excluído com sucesso!", {})
  }

  const addTask = (projectId: string, taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newProjects = projects.map((project) =>
      project.id === projectId
        ? {
          ...project,
          tasks: [...project.tasks, newTask],
          updatedAt: new Date().toISOString(),
        }
        : project,
    )
    saveProjects(newProjects)

    toast("Nova tarefa adicionada com sucesso!", {})
  }

  const updateTask = (projectId: string, taskId: string, updates: Partial<Task>) => {
    const newProjects = projects.map((project) =>
      project.id === projectId
        ? {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
          ),
          updatedAt: new Date().toISOString(),
        }
        : project,
    )
    saveProjects(newProjects)
  }

  const deleteTask = (projectId: string, taskId: string) => {
    const newProjects = projects.map((project) =>
      project.id === projectId
        ? {
          ...project,
          tasks: project.tasks.filter((task) => task.id !== taskId),
          updatedAt: new Date().toISOString(),
        }
        : project,
    )
    saveProjects(newProjects)

    toast("Tarefa excluida com sucesso!", {})
  }

  const addComment = (projectId: string, taskId: string, commentData: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const newProjects = projects.map((project) =>
      project.id === projectId
        ? {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId
              ? {
                ...task,
                comments: [...task.comments, newComment],
                updatedAt: new Date().toISOString(),
              }
              : task,
          ),
          updatedAt: new Date().toISOString(),
        }
        : project,
    )
    saveProjects(newProjects)
  }

  const reorderTasks = (projectId: string, reorderedTasks: Task[]) => {
    const newProjects = projects.map((project) =>
      project.id === projectId
        ? {
          ...project,
          tasks: reorderedTasks,
          updatedAt: new Date().toISOString(),
        }
        : project,
    )
    saveProjects(newProjects)
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addComment,
        reorderTasks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects deve ser usado dentro de um ProjectProvider')
  }
  return context
}
