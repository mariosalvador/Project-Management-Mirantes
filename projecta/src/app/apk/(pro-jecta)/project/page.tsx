"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveContainer, PageSection } from "@/components/ui/responsive-container"
import { ProjectGrid } from "@/components/projecta/project/project-grid"
import { Plus, Search, Filter, Grid, List, RefreshCw, Users, Target, Calendar } from "lucide-react"
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
          {/* Conteúdo do header */}
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="on-hold">Em pausa</option>
              <option value="completed">Concluído</option>
            </select>

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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card text-card-foreground rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Projetos</h3>
            <p className="text-2xl font-bold">{projects.length}</p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-muted-foreground">Projetos Ativos</h3>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-muted-foreground">Em Planejamento</h3>
            <p className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'planning').length}
            </p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-muted-foreground">Concluídos</h3>
            <p className="text-2xl font-bold text-purple-600">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Grade de projetos */}
        <PageSection>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando projetos...</p>
            </div>
          ) : projects.length === 0 && !searchTerm && statusFilter === "all" ? (
            // Estado inicial: nenhum projeto criado
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Bem-vindo ao Projecta!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Você ainda não tem projetos. Comece criando seu primeiro projeto para organizar suas tarefas e colaborar com sua equipe.
              </p>
              <Link href="/apk/project/create">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Meu Primeiro Projeto
                </Button>
              </Link>

              {/* Dicas rápidas */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-4 border rounded-lg bg-card">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Colabore em Equipe</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione membros, atribua tarefas e acompanhe o progresso juntos
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-card">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Organize Tarefas</h4>
                  <p className="text-sm text-muted-foreground">
                    Crie tarefas, defina prazos e acompanhe marcos importantes
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-card">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Acompanhe Progresso</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize relatórios e mantenha tudo sob controle
                  </p>
                </div>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            // Estado de filtro sem resultados
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos projetos com os filtros aplicados. Tente ajustar sua busca.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                >
                  Limpar Filtros
                </Button>
                <Link href="/apk/project/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Novo Projeto
                  </Button>
                </Link>
              </div>
            </div>
          ) : viewMode === "grid" ? (
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
