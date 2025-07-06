"use client"

import { useEffect } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/RouteProtection"
import { UserInfo } from "@/components/auth/UserComponents"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatusIcon } from "@/utils/notification"
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/utils/tasksFormatters"

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, loading, error, loadProjects } = useProjects()

  // Carregar projetos quando o usuário estiver autenticado
  useEffect(() => {
    if (user?.uid) {
      loadProjects()
    }
  }, [user?.uid, loadProjects])

  // Calcular estatísticas dos projetos
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    planning: projects.filter(p => p.status === "planning").length,
    onHold: projects.filter(p => p.status === "on-hold").length,
  }

  // Estatísticas adicionais baseadas nos dados reais
  const totalTasks = projects.reduce((acc, project) => acc + (project.tasks?.length || 0), 0)
  const completedTasks = projects.reduce((acc, project) =>
    acc + (project.tasks?.filter(task => task.status === 'completed').length || 0), 0
  )
  const totalTeamMembers = projects.reduce((acc, project) => acc + (project.teamMembers || 0), 0)
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, project) => acc + (project.progress || 0), 0) / projects.length)
    : 0

  // Projetos recentes ordenados por data de atualização
  const recentProjects = projects
    .filter(p => p.updatedAt)  
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 3)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Carregando projetos...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-red-500">Erro ao carregar projetos: {error}</p>
              <Button onClick={loadProjects} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Painel</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu painel de controle de projetos</p>
          </div>
          <Button asChild>
            <Link href="/apk/project/create">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        <DashboardStats
          stats={stats}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          totalTeamMembers={totalTeamMembers}
          avgProgress={avgProgress}
        />

        {/* Grid com Recent Projects e User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projetos Recentes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/apk/project">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/apk/project/${project.title}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(project.status)}
                          <div>
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status === "active" ? "Ativo" :
                              project.status === "completed" ? "Concluído" :
                                project.status === "planning" ? "Planejamento" : "Pausado"}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {project.tasks?.length || 0} tarefas
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum projeto encontrado</p>
                  <Button className="mt-4" asChild>
                    <Link href="/apk/project/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeiro projeto
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Info */}
          <div className="space-y-6">
            <UserInfo />
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}