"use client";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Target,
  ArrowLeft,
  Plus,
  Grid3X3,
  AlertCircle,
  Briefcase,
  Flag,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel, getTaskStatusColor, getTaskStatusLabel } from "@/utils/tasksFormatters";
import { useProjectByTitle } from "@/hooks/useProjects";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formatFirestoreDate } from "@/utils/dateUtils";

export default function ProjectDetailsPage() {
  const { name } = useParams<{ name: string }>();

  // Decodificar o nome do projeto da URL
  const decodedName = decodeURIComponent(name);

  // Usar hook para buscar projeto pelo título
  const { project, loading, error, refreshProject } = useProjectByTitle(decodedName);

  // Buscar informações do usuário criador
  const { userInfo: creatorInfo, loading: creatorLoading } = useUserInfo(project?.createdBy || null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
        <h2 className="text-xl font-semibold mb-2">Carregando projeto...</h2>
        <p className="text-muted-foreground">
          Buscando informações do projeto &quot;{decodedName}&quot;
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar projeto</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={refreshProject}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Link href="/apk/project">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O projeto &quot;{decodedName}&quot; não foi encontrado.
        </p>
        <Link href="/apk/project">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Projetos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/apk/project">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks/manage`}>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </Link>
          <Link href={`/apk/project/${encodeURIComponent(project.title)}/edit`}>
            <Button>
              Editar Projeto
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Progresso</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{project.progress || 0}%</div>
                  <Progress
                    value={project.progress || 0}
                    size="md"
                    color={
                      (project.progress || 0) >= 80 ? "success" :
                        (project.progress || 0) >= 50 ? "default" :
                          "warning"
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Tarefas</span>
                </div>
                <div className="text-2xl font-bold">
                  {project.tasksCompleted || 0}/{project.totalTasks || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {project.tasksCompleted && project.totalTasks
                    ? Math.round((project.tasksCompleted / project.totalTasks) * 100)
                    : 0}% concluídas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Equipe</span>
                </div>
                <div className="text-2xl font-bold">{project.teamMembers || project.team?.length || 0}</div>
                <div className="text-xs text-muted-foreground">membros ativos</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Entrega</span>
                </div>
                <div className="text-sm font-bold">{project.dueDate || 'Não definido'}</div>
                <div className="text-xs text-muted-foreground">prazo final</div>
              </CardContent>
            </Card>
          </div>

          {/* Tarefas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tarefas do Projeto
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks`}>
                    <Button variant="outline" size="sm">
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Ver Quadro
                    </Button>
                  </Link>
                  <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks/manage`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.tasks && project.tasks.length > 0 ? (
                  project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Atribuído a: {task.assignees?.join(', ') || 'Não atribuído'}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTaskStatusColor(task.status)}>
                          {getTaskStatusLabel(task.status)}
                        </Badge>
                        <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks/manage?taskId=${task.id}`}>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tarefa criada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marcos do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Marcos do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {milestone.date}
                          </span>
                        </div>
                      </div>
                      <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                        {milestone.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum marco definido ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra Lateral */}
        <div className="space-y-6">
          {/* Informações do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informações do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-sm font-medium text-muted-foreground">Prioridade</span>
                <div className="mt-1">
                  <Badge className={getPriorityColor(project.priority || 'medium')}>
                    {getPriorityLabel(project.priority || 'medium')}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-sm font-medium text-muted-foreground">Categoria</span>
                <div className="mt-1 font-medium">{project.category || 'Não definido'}</div>
              </div>

              <Separator />

              <div>
                <span className="text-sm font-medium text-muted-foreground">Gerente do Projeto</span>
                <div className="mt-1 font-medium">{project.manager || 'Não atribuído'}</div>
              </div>

              <Separator />

              {project.startDate && (
                <>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Data de Início</span>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.startDate}</span>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              <div>
                <span className="text-sm font-medium text-muted-foreground">Data de Entrega</span>
                <div className="mt-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{project.dueDate || 'Não definido'}</span>
                </div>
              </div>

              <Separator />

              {project.createdBy && (
                <>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Criado por</span>
                    <div className="mt-1 font-medium">
                      {creatorLoading ? (
                        <span className="text-muted-foreground">Carregando...</span>
                      ) : (
                        creatorInfo?.displayName || creatorInfo?.email || "Usuário desconhecido"
                      )}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {project.createdAt && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data de Criação</span>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>{formatFirestoreDate(project.createdAt)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipe do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipe do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.team && project.team.length > 0 ? (
                  project.team.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        {member.avatar}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{member.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{member.role}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum membro da equipe ainda</p>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}