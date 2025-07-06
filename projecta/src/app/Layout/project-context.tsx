"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useProjects as useProjectsHook } from "@/hooks/useProjects"
import { Project } from "@/types/project"
import { CreateProjectData } from "@/Api/services/projects"

interface ProjectContextType {
  projects: Project[]
  loading: boolean
  error: string | null
  loadProjects: () => Promise<void>
  createNewProject: (data: CreateProjectData) => Promise<string | null>
  updateProjectData: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProjectData: (projectId: string) => Promise<void>
  refreshProject: (projectId: string) => Promise<Project | null>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const projectsData = useProjectsHook()

  return (
    <ProjectContext.Provider value={projectsData}>
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
