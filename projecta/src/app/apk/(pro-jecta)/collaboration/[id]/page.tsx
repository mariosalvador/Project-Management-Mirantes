"use client"

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useCollaborationData } from '@/hooks/useCollaborationData';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCard } from '@/components/projecta/Collaboration/task-card';
import { getPriorityColor, getStatusColor } from '@/utils/tasksFormatters';
import { formatDate } from '@/utils/formatDate';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.id as string;

  const {
    userProjects,
    loading,
    error,
    updateTaskStatus
  } = useCollaborationData();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'comments'>('overview');

  // Encontrar o projeto atual
  const project = userProjects.find(p => p.id === projectId);

  // Hook de comentários para o projeto
  const {
    comments: projectComments,
    loading: commentsLoading,
    newComment,
    setNewComment,
    submitComment,
    canUserComment: canCommentOnProject
  } = useComments({
    contextType: 'project',
    contextId: projectId,
    projectId: projectId,
    allowedUsers: project?.team?.map(m => m.email || m.name) || []
  });

  // Hook de comentários para a tarefa selecionada
  const selectedTask = project?.tasks?.find(t => t.id === selectedTaskId);
  const {
    comments: taskComments,
    loading: taskCommentsLoading,
    newComment: newTaskComment,
    setNewComment: setNewTaskComment,
    submitComment: submitTaskComment,
    canUserComment: canCommentOnTask
  } = useComments({
    contextType: 'task',
    contextId: selectedTaskId || '',
    projectId: projectId,
    allowedUsers: selectedTask?.assignees || []
  });

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando projeto...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error || !project) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Projeto não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'O projeto que você está procurando não existe ou você não tem acesso a ele.'}
          </p>
          <Button onClick={() => router.push('/apk/collaboration')}>
            Voltar para Colaboração
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  // Estatísticas do projeto
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const activeTasks = project.tasks?.filter(t => t.status === 'active').length || 0;
  const pendingTasks = project.tasks?.filter(t => t.status === 'pending').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/apk/collaboration')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status === 'active' ? 'Ativo' :
                project.status === 'completed' ? 'Concluído' :
                  project.status === 'planning' ? 'Planejamento' : 'Pausado'}
            </Badge>
            <Badge className={getPriorityColor(project.priority || 'medium')}>
              {project.priority === 'high' ? 'Alta' :
                project.priority === 'low' ? 'Baixa' : 'Média'}
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Progresso</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Tarefas</p>
                  <p className="text-lg font-bold">{completedTasks}/{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Equipe</p>
                  <p className="text-lg font-bold">{project.team?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Prazo</p>
                  <p className="text-sm font-bold">
                    {project.dueDate ? formatDate(project.dueDate) : 'Não definido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tasks">
              Tarefas ({totalTasks})
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comentários ({projectComments.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <p className="text-muted-foreground">{project.category || 'Não definida'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gerente:</span>
                      <p className="text-muted-foreground">{project.manager || 'Não definido'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data de Início:</span>
                      <p className="text-muted-foreground">
                        {project.startDate ? formatDate(project.startDate) : 'Não definida'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Data de Entrega:</span>
                      <p className="text-muted-foreground">
                        {project.dueDate ? formatDate(project.dueDate) : 'Não definida'}
                      </p>
                    </div>
                  </div>

                  {project.budget && (
                    <div>
                      <span className="font-medium">Orçamento:</span>
                      <p className="text-muted-foreground">{project.budget}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipe do Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.team?.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                        {member.email === user?.email && (
                          <Badge variant="secondary" className="text-xs">Você</Badge>
                        )}
                      </div>
                    )) || <p className="text-muted-foreground">Nenhum membro na equipe</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity or Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Marcos do Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className={`h-3 w-3 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        <div className="flex-1">
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(milestone.date)}
                          </p>
                        </div>
                        {milestone.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Task Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Pendentes</p>
                      <p className="text-xl font-bold">{pendingTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Ativas</p>
                      <p className="text-xl font-bold">{activeTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Concluídas</p>
                      <p className="text-xl font-bold">{completedTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks List */}
            {totalTasks === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                  <p className="text-muted-foreground">
                    Este projeto ainda não possui tarefas definidas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.tasks?.map((task) => {
                  const canEditTask = task.assignees.includes(user?.email || '') ||
                    task.assignees.includes(user?.displayName || '') ||
                    project.userRole === 'admin' ||
                    project.userRole === 'manager';

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(taskId, newStatus) =>
                        updateTaskStatus(projectId, taskId, newStatus)
                      }
                      canEdit={canEditTask}
                      members={project.team?.map(m => ({
                        id: m.id,
                        name: m.name,
                        avatar: m.avatar
                      })) || []}
                      isSelected={selectedTaskId === task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                    />
                  );
                })}
              </div>
            )}

            {/* Task Comments Section */}
            {selectedTask && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comentários da Tarefa: {selectedTask.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {taskCommentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Comment Form */}
                      {canCommentOnTask && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <textarea
                              value={newTaskComment}
                              onChange={(e) => setNewTaskComment(e.target.value)}
                              placeholder="Adicione um comentário à esta tarefa..."
                              className="w-full p-2 border rounded resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                onClick={() => submitTaskComment()}
                                disabled={!newTaskComment.trim()}
                              >
                                Comentar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      {taskComments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          Nenhum comentário nesta tarefa ainda.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {taskComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {comment.authorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted p-3 rounded">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.authorName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentários do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Comment Form */}
                    {canCommentOnProject && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Compartilhe suas ideias sobre o projeto..."
                            className="w-full p-3 border rounded resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              onClick={() => submitComment()}
                              disabled={!newComment.trim()}
                            >
                              Publicar Comentário
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    {projectComments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum comentário ainda</h3>
                        <p className="text-muted-foreground">
                          Seja o primeiro a comentar sobre este projeto!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projectComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {comment.authorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">{comment.authorName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                  {comment.isEdited && (
                                    <span className="text-xs text-muted-foreground">(editado)</span>
                                  )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}
