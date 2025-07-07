"use client"

import { Button } from "@/components/ui/button"
import { ResponsiveContainer, PageSection } from "@/components/ui/responsive-container"
import { ProjectGrid } from "@/components/projecta/project/project-grid"
import { EmptyState } from "@/components/projecta/project/EmptyState"
import { ProjectStats } from "@/components/projecta/project/ProjectStats"
import { ProjectFilters } from "@/components/projecta/project/ProjectFilters"
import { Plus, RefreshCw } from "lucide-react"
import { useState, useMemo } from "react"
import { useIsMobile } from "@/lib/use-media-query"
import { useProjects } from "@/hooks/useProjects"
import Link from "next/link"


export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const isMobile = useIsMobile()
  const { projects, loading, error, loadProjects } = useProjects()

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, statusFilter])

  const handleRefresh = () => {
    loadProjects()
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  if (error && error.includes("Usuário não autenticado")) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <p className="text-yellow-600 mb-4">Você precisa estar autenticado para ver seus projetos.</p>
          <Link href="/auth/login">
            <Button>
              Fazer Login
            </Button>
          </Link>
        </div>
      </ResponsiveContainer>
    )
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Projetos"
          description="Gerencie todos os seus projetos em um só lugar"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/apk/project/create">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {isMobile ? "Novo" : "Novo Projeto"}
                </Button>
              </Link>
            </div>
          }
        >
        </PageSection>

        {/* Filtros e busca */}
        <ProjectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Estatísticas */}
        <ProjectStats projects={projects} />

        {/* Grade de projetos */}
        <PageSection>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando projetos...</p>
            </div>
          ) : projects.length === 0 && !searchTerm && statusFilter === "all" ? (
            <EmptyState type="initial" />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              type="search"
              searchTerm={searchTerm}
              onClearFilters={handleClearFilters}
            />
          ) : viewMode === "grid" ? (
            <ProjectGrid projects={filteredProjects} />
          ) : (
            <div className="space-y-4">
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
