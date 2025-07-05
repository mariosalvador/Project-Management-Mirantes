"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  MessageCircle,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Share2,
  Plus
} from 'lucide-react';
import { Project, Task } from '@/types/project';
import { ProjectWithCollaboration } from '@/types/collaboration';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate } from '@/utils/formatDate';
import { ActivityFeed } from '../Activity/activity-feed';
import { CommentSection } from '../Comment/comment-section';
import { cn } from '@/lib/utils';

interface ProjectCollaborationProps {
  project: ProjectWithCollaboration;
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void;
  onAddMember?: (projectId: string, userId: string, role: string) => void;
  onRemoveMember?: (projectId: string, userId: string) => void;
  onCreateTask?: (projectId: string, task: Omit<Task, 'id'>) => void;
  className?: string;
}

export function ProjectCollaboration({
  project,
  onAddMember,
  onRemoveMember,
  onCreateTask,
  className
}: ProjectCollaborationProps) {
  const { hasPermission, users } = usePermissions();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activity' | 'comments'>('overview');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const canEdit = hasPermission('project', 'update');
  const canAssign = hasPermission('project', 'assign');

  // Estatísticas do projeto
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0;
  const activeTasks = project.tasks?.filter(task => task.status === 'active').length || 0;
  const pendingTasks = project.tasks?.filter(task => task.status === 'pending').length || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Membros do projeto
  const projectMembers = project.team || [];
  const availableUsers = users.filter(user =>
    !projectMembers.some(member => member.id === user.id)
  );

  // Atividades recentes
  const recentActivities = project.collaboration?.activities || [];

  const handleAddMember = (userId: string, role: string) => {
    if (onAddMember) {
      onAddMember(project.id, userId, role);
      setShowAddMember(false);
    }
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || !onCreateTask) return;

    const newTask: Omit<Task, 'id'> = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: 'pending',
      assignees: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de hoje
      priority: 'medium'
    };

    onCreateTask(project.id, newTask);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowCreateTask(false);
  };

  const TabButton = ({ tab, children }: { tab: typeof activeTab, children: React.ReactNode }) => (
    <Button
      variant={activeTab === tab ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(tab)}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cabeçalho do Projeto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={
                project.status === 'active' ? 'default' :
                  project.status === 'completed' ? 'secondary' : 'outline'
              }>
                {project.status === 'active' ? 'Ativo' :
                  project.status === 'completed' ? 'Concluído' :
                    project.status === 'planning' ? 'Planejamento' : 'Pausado'}
              </Badge>
              {project.priority && (
                <Badge variant={
                  project.priority === 'high' ? 'destructive' :
                    project.priority === 'medium' ? 'default' : 'secondary'
                }>
                  {project.priority === 'high' ? 'Alta' :
                    project.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Progresso</Label>
              <Progress value={progressPercent} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {completedTasks} de {totalTasks} tarefas concluídas
              </p>
            </div>
            <div className="space-y-2">
              <Label>Membros da Equipe</Label>
              <div className="flex -space-x-2">
                {projectMembers.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {projectMembers.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{projectMembers.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
            {project.dueDate && (
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.dueDate)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Última Atividade</Label>
              <p className="text-sm text-muted-foreground">
                {recentActivities.length > 0
                  ? formatDate(recentActivities[0].createdAt)
                  : 'Nenhuma atividade'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação por Abas */}
      <div className="flex gap-2 flex-wrap">
        <TabButton tab="overview">
          <Target className="h-4 w-4 mr-2" />
          Visão Geral
        </TabButton>
        <TabButton tab="members">
          <Users className="h-4 w-4 mr-2" />
          Membros ({projectMembers.length})
        </TabButton>
        <TabButton tab="activity">
          <TrendingUp className="h-4 w-4 mr-2" />
          Atividades ({recentActivities.length})
        </TabButton>
        <TabButton tab="comments">
          <MessageCircle className="h-4 w-4 mr-2" />
          Discussões
        </TabButton>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas de Tarefas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas de Tarefas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Concluídas</span>
                </div>
                <Badge variant="secondary">{completedTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Em Andamento</span>
                </div>
                <Badge variant="default">{activeTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Pendentes</span>
                </div>
                <Badge variant="outline">{pendingTasks}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canEdit && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowCreateTask(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Tarefa
                </Button>
              )}
              {canAssign && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAddMember(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar Projeto
              </Button>
              {canEdit && (
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Membros da Equipe</CardTitle>
              {canAssign && (
                <Button onClick={() => setShowAddMember(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  </div>
                  {canAssign && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onRemoveMember?.(project.id, member.id)}>
                          Remover do Projeto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              projectId={project.id}
              maxItems={10}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'comments' && (
        <Card>
          <CardHeader>
            <CardTitle>Discussões do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentSection
              projectId={project.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Modal para Adicionar Membro */}
      {showAddMember && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Membro ao Projeto</h3>
            <div className="space-y-4">
              {availableUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(user.id, user.role)}
                  >
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal para Criar Tarefa */}
      {showCreateTask && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Criar Nova Tarefa</h3>
            <div className="space-y-4">
              <div>
                <Label>Título da Tarefa</Label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Digite o título da tarefa..."
                />
              </div>
              <div>
                <Label>Descrição (Opcional)</Label>
                <Input
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Descreva a tarefa..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                Criar Tarefa
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
