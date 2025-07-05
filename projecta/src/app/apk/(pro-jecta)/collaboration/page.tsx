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
  Bell,
  Settings
} from 'lucide-react';
import { ResponsiveContainer, PageSection } from '@/components/ui/responsive-container';
import { GenericCollaboration } from '@/components/projecta/Collaboration/generic-collaboration';
import { usePermissions } from '@/hooks/usePermissions';

// Mock data para demonstração  
const mockProject = {
  id: 'project-1',
  title: 'Sistema de Gestão de Projetos',
  description: 'Desenvolvimento de uma plataforma completa para gestão de projetos colaborativos',
  status: 'active' as const,
  progress: 65,
  dueDate: '2025-08-15',
  team: [
    { id: '1', name: 'Mario Salvador', role: 'Project Manager', avatar: 'https://github.com/mariosalvador.png' },
    { id: '2', name: 'Ana Silva', role: 'Developer', avatar: '' },
    { id: '3', name: 'João Santos', role: 'Designer', avatar: '' }
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
  ]
};

export default function CollaborationPage() {
  const { hasPermission } = usePermissions();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-1');
  const [activeView, setActiveView] = useState<'project' | 'tasks' | 'activity'>('project');

  const canEdit = hasPermission('project', 'update');

  // Estatísticas do projeto
  const completedTasks = mockProject.tasks.filter(task => task.status === 'completed').length;
  const activeTasks = mockProject.tasks.filter(task => task.status === 'active').length;

  // IDs dos membros do projeto
  const projectMemberIds = mockProject.team.map(member => member.id);

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Colaboração do Projeto"
          description="Sistema genérico de colaboração para projetos e tarefas"
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
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          {/* Colaboração do Projeto */}
          <TabsContent value="project" className="space-y-6">
            <GenericCollaboration
              contextId={mockProject.id}
              contextType="project"
              contextTitle={mockProject.title}
              membersIds={projectMemberIds}
            />
          </TabsContent>

          {/* Gestão de Tarefas */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Tarefas */}
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas do Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockProject.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTaskId === task.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {task.status === 'completed' ? 'Concluída' :
                            task.status === 'active' ? 'Ativa' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Colaboração da Tarefa Selecionada */}
              {selectedTaskId && (
                <div>
                  <GenericCollaboration
                    contextId={selectedTaskId}
                    contextType="task"
                    contextTitle={mockProject.tasks.find(t => t.id === selectedTaskId)?.title || 'Tarefa'}
                    membersIds={mockProject.tasks.find(t => t.id === selectedTaskId)?.assignees || []}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Atividades Gerais */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feed de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma atividade recente</h3>
                  <p className="text-muted-foreground">
                    As atividades de colaboração aparecerão aqui conforme os membros interagem.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
}
