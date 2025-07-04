"use client"

import { useProjects } from "../Layout/project-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, Pause, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { getStatusColor } from "@/utils/tasksFormatters"

export default function DashboardPage() {
  const { projects } = useProjects()

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    planning: projects.filter(p => p.status === "planning").length,
    onHold: projects.filter(p => p.status === "on-hold").length,
  }

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "on-hold":
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Planejamento</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.planning}</div>
            <p className="text-xs text-muted-foreground">
              Sendo planejados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
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
            <Link href={`/apk/project/${recentProjects[0].title}`} className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      {project.tasks.length} tarefas
                    </div>
                  </div>
                </div>
              ))}
            </Link>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
              <Button className="mt-4" asChild>
                <Link href="/apk/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro projeto
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}