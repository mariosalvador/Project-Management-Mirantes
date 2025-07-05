/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Activity,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Bell,
  Settings
} from 'lucide-react';
import { ResponsiveContainer, PageSection } from '@/components/ui/responsive-container';
import { ProjectCollaboration } from '@/components/projecta/Collaboration/project-collaboration';
import { ActivityFeed } from '@/components/projecta/Activity/activity-feed';
import { NotificationCenter } from '@/components/projecta/Notification/notification-center';
import { usePermissions } from '@/hooks/usePermissions';
import { useTaskCollaboration } from '@/hooks/useTaskCollaboration';
import { cn } from '@/lib/utils';

import { Project } from '@/types/project';
import { TaskCollaboration } from '@/components/projecta/Collaboration/task-collaboration';
import { TaskCardWithPermissions } from '@/components/ui/task-card-with-permissions';

// Mock data para demonstração
const mockProject: Project & {
  collaboration: {
    comments: any[];
    activities: any[];
    permissions: any[];
  };
} = {
  id: 'project-1',
  title: 'Sistema de Gestão de Projetos',
  description: 'Desenvolvimento de uma plataforma completa para gestão de projetos colaborativos',
  status: 'active' as const,
  progress: 65,
  dueDate: '2025-08-15',
  team: [
    {
      id: '1',
      name: 'Mario Salvador',
      role: 'Project Manager',
      avatar: 'https://github.com/mariosalvador.png'
    },
    {
      id: '2',
      name: 'Ana Silva',
      role: 'Developer',
      avatar: ''
    },
    {
      id: '3',
      name: 'João Santos',
      role: 'Designer',
      avatar: ''
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Implementar Sistema de Colaboração',
      description: 'Criar componentes para permitir colaboração entre membros da equipe',
      status: 'active' as const,
      assignees: ['1', '2'],
      dueDate: '2025-07-10',
      priority: 'high' as const
    },
    {
      id: 'task-2',
      title: 'Design da Interface de Usuário',
      description: 'Criar layouts e componentes visuais para o sistema',
      status: 'completed' as const,
      assignees: ['3'],
      dueDate: '2025-07-05',
      priority: 'medium' as const
    },
    {
      id: 'task-3',
      title: 'Integração com API',
      description: 'Conectar frontend com serviços backend',
      status: 'pending' as const,
      assignees: ['2'],
      dueDate: '2025-07-15',
      priority: 'medium' as const
    }
  ],
  collaboration: {
    comments: [],
    activities: [],
    permissions: []
  }
};

export default function CollaborationPage() {
  const { currentUser, hasPermission } = usePermissions();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'project' | 'tasks' | 'activity' | 'notifications'>('project');

  // Hook de colaboração para tarefa selecionada
  const taskCollaboration = useTaskCollaboration({
    projectId: mockProject.id,
    taskId: selectedTaskId || 'task-1'
  });

  const canEdit = hasPermission('project', 'update');
  const canAssign = hasPermission('project', 'assign');

  // Estatísticas do projeto
  const totalTasks = mockProject.tasks.length;
  const completedTasks = mockProject.tasks.filter(task => task.status === 'completed').length;
  const activeTasks = mockProject.tasks.filter(task => task.status === 'active').length;
  const pendingTasks = mockProject.tasks.filter(task => task.status === 'pending').length;

  const handleTaskStatusChange = (taskId: string, newStatus: 'completed' | 'active' | 'pending') => {
    console.log(`Mudando status da tarefa ${taskId} para ${newStatus}`);
    // Aqui você implementaria a lógica real de atualização
  };

  const handleTaskAssign = (taskId: string, userId: string) => {
    console.log(`Atribuindo tarefa ${taskId} para usuário ${userId}`);
    // Aqui você implementaria a lógica real de atribuição
  };

  const handleProjectUpdate = (projectId: string, updates: any) => {
    console.log(`Atualizando projeto ${projectId}:`, updates);
    // Aqui você implementaria a lógica real de atualização do projeto
  };

  const handleAddMember = (projectId: string, userId: string, role: string) => {
    console.log(`Adicionando membro ${userId} com role ${role} ao projeto ${projectId}`);
    // Aqui você implementaria a lógica real de adição de membro
  };

  const handleRemoveMember = (projectId: string, userId: string) => {
    console.log(`Removendo membro ${userId} do projeto ${projectId}`);
    // Aqui você implementaria a lógica real de remoção de membro
  };

  const handleCreateTask = (projectId: string, task: any) => {
    console.log(`Criando nova tarefa no projeto ${projectId}:`, task);
    // Aqui você implementaria a lógica real de criação de tarefa
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Colaboração do Projeto"
          description="Gerencie a colaboração entre membros da equipe, comentários e atividades"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              {canEdit && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              )}
            </div>
          }
        />

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Membros da Equipe</p>
                  <p className="text-2xl font-bold">{mockProject.team.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">{activeTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold">{mockProject.progress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação Principal */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as typeof activeView)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projeto
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Colaboração do Projeto */}
          <TabsContent value="project" className="space-y-6">
            <ProjectCollaboration
              project={mockProject}
              onProjectUpdate={handleProjectUpdate}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onCreateTask={handleCreateTask}
            />
          </TabsContent>

          {/* Gestão de Tarefas */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Tarefas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Tarefas do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockProject.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedTaskId === task.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <TaskCardWithPermissions
                        task={task}
                        onStatusChange={handleTaskStatusChange}
                        onAssign={handleTaskAssign}
                        projectTitle={mockProject.title}
                        className="border-0 shadow-none p-0"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Colaboração da Tarefa Selecionada */}
              {selectedTaskId && (
                <div>
                  <TaskCollaboration
                    task={mockProject.tasks.find(t => t.id === selectedTaskId) as any}
                    projectId={mockProject.id}
                    onTaskUpdate={(taskId, updates) => {
                      if (updates.status) {
                        handleTaskStatusChange(taskId, updates.status);
                      }
                    }}
                    onAssignUser={handleTaskAssign}
                    onUnassignUser={(taskId, userId) => {
                      console.log(`Removendo atribuição da tarefa ${taskId} do usuário ${userId}`);
                    }}
                    onUpdateWatchers={(taskId, watchers) => {
                      console.log(`Atualizando observadores da tarefa ${taskId}:`, watchers);
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Feed de Atividades */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed
                  projectId={mockProject.id}
                  showFilters={true}
                  maxItems={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Centro de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Centro de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}
