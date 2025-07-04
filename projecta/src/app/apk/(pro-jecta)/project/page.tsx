"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveContainer, PageSection } from "@/components/ui/responsive-container"
import { ProjectGrid } from "@/components/projecta/project-grid"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { useState } from "react"
import { useIsMobile } from "@/lib/use-media-query"

// Mock data para exemplo
const mockProjects = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Redesign completo do site da empresa com nova identidade visual",
    status: "active",
    progress: 65,
    dueDate: "15 Jul 2025",
    teamMembers: 5,
    tasksCompleted: 12,
    totalTasks: 18
  },
  {
    id: "2",
    title: "App Mobile",
    description: "Desenvolvimento do aplicativo mobile para iOS e Android",
    status: "planning",
    progress: 25,
    dueDate: "30 Ago 2025",
    teamMembers: 8,
    tasksCompleted: 3,
    totalTasks: 24
  },
  {
    id: "3",
    title: "Sistema CRM",
    description: "Implementação do novo sistema de gerenciamento de clientes",
    status: "completed",
    progress: 100,
    dueDate: "01 Jun 2025",
    teamMembers: 6,
    tasksCompleted: 15,
    totalTasks: 15
  }
]

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const isMobile = useIsMobile()

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Projetos"
          description="Gerencie todos os seus projetos em um só lugar"
          action={
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? "Novo" : "Novo Projeto"}
            </Button>
          }
        >
          
        </PageSection>

        {/* Filtros e busca */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {!isMobile && "Filtros"}
            </Button>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none border-r"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grade de projetos */}
        <PageSection>
          {viewMode === "grid" ? (
            <ProjectGrid projects={filteredProjects} />
          ) : (
            <div className="space-y-4">
              {/* Lista de projetos - implementar depois */}
              <p className="text-muted-foreground text-center py-8">
                Visualização em lista em desenvolvimento
              </p>
            </div>
          )}
        </PageSection>
      </div>
    </ResponsiveContainer>
  )
}
