"use client"

import { Comment } from "@/types/collaboration"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { getSampleProjects } from "./mock-projects"

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

export interface ProjectSample {
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
  projects: ProjectSample[]
  createProject: (project: Omit<ProjectSample, "id" | "createdAt" | "updatedAt" | "tasks">) => void
  updateProject: (id: string, updates: Partial<ProjectSample>) => void
  deleteProject: (id: string) => void
  addTask: (projectId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  addComment: (projectId: string, taskId: string, comment: Omit<Comment, "id" | "createdAt">) => void
  reorderTasks: (projectId: string, tasks: Task[]) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectSample[]>([])


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


  const saveProjects = (newProjects: ProjectSample[]) => {
    setProjects(newProjects)
    localStorage.setItem("projects", JSON.stringify(newProjects))
  }

  const createProject = (projectData: Omit<ProjectSample, "id" | "createdAt" | "updatedAt" | "tasks">) => {
    const newProject: ProjectSample = {
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

  const updateProject = (id: string, updates: Partial<ProjectSample>) => {
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
