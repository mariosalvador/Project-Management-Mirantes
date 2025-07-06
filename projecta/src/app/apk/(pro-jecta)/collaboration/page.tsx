"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  CheckCircle,
  Target,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, PageSection } from '@/components/ui/responsive-container';
import { GenericCollaboration } from '@/components/projecta/Collaboration/generic-collaboration';
import { TaskCard } from '@/components/projecta/Collaboration/task-card';
import { EmptyState } from '@/components/projecta/Collaboration/empty-state';
import { CollaborationStats } from '@/components/projecta/Collaboration/collaboration-stats';
import { useCollaborationData } from '@/hooks/useCollaborationData';
import { useAuth } from '@/contexts/AuthContext';

export default function CollaborationPage() {
  const { user } = useAuth();
  const {
    userProjects,
    stats,
    loading,
    error,
    updateTaskStatus,
    refreshData
  } = useCollaborationData();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'projects' | 'tasks' | 'activity'>('projects');

  // Encontrar projeto e tarefa selecionados
  const selectedProject = selectedProjectId
    ? userProjects.find(p => p.id === selectedProjectId)
    : null;

  const selectedTask = selectedTaskId && selectedProject
    ? selectedProject.tasks?.find(t => t.id === selectedTaskId)
    : null;

  // Obter todas as tarefas do usuário
  const userTasks = userProjects.flatMap(project =>
    project.tasks?.filter(task =>
      task.assignees.includes(user?.uid || '')
    ).map(task => ({ ...task, projectId: project.id, projectTitle: project.title })) || []
  );

  // Selecionar automaticamente o primeiro projeto se nenhum estiver selecionado
  React.useEffect(() => {
    if (userProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(userProjects[0].id);
    }
  }, [userProjects, selectedProjectId]);

  // Selecionar automaticamente a primeira tarefa quando um projeto é selecionado
  React.useEffect(() => {
    if (selectedProject?.tasks?.length && !selectedTaskId) {
      setSelectedTaskId(selectedProject.tasks[0].id);
    }
  }, [selectedProject, selectedTaskId]);

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados de colaboração...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>
            Tentar Novamente
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Colaboração do Projeto"
          description="Sistema genérico de colaboração para projetos e tarefas"
          action={
            <>  </>
          }
        />

        {/* Estatísticas Rápidas */}
        <CollaborationStats stats={stats} />

        {/* Navegação Principal */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as typeof activeView)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Minhas Tarefas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividades
            </TabsTrigger>
          </TabsList>

          {/* Lista de Projetos e Colaboração */}
          <TabsContent value="projects" className="space-y-6">
            {userProjects.length === 0 ? (
              <EmptyState type="projects" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Projetos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Projetos ({userProjects.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                          }`}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{project.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {project.status === 'completed' ? 'Concluído' :
                              project.status === 'active' ? 'Ativo' :
                                project.status === 'planning' ? 'Planejamento' : 'Pausado'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Função: {project.userRole || 'Membro'}</span>
                          <span>Tarefas: {project.tasks?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Colaboração do Projeto Selecionado */}
                {selectedProject && (
                  <div>
                    <GenericCollaboration
                      contextId={selectedProject.id}
                      contextType="project"
                      contextTitle={selectedProject.title}
                      membersIds={selectedProject.members.map(m => m.userId)}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Gestão de Tarefas do Usuário */}
          <TabsContent value="tasks" className="space-y-6">
            {userTasks.length === 0 ? (
              <EmptyState
                type="tasks"
                onAction={() => setActiveView('projects')}
                actionLabel="Ver Projetos"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {userTasks.map((task) => {
                  const project = userProjects.find(p => p.id === task.projectId);
                  const canEditTask = task.assignees.includes(user?.uid || '') ||
                    project?.userRole === 'admin' ||
                    project?.userRole === 'manager';

                  return (
                    <TaskCard
                      key={`${task.projectId}-${task.id}`}
                      task={task}
                      onStatusChange={(taskId, newStatus) =>
                        updateTaskStatus(task.projectId, taskId, newStatus)
                      }
                      canEdit={canEditTask}
                      members={project?.members.map(m => ({
                        id: m.userId,
                        name: m.name,
                        avatar: m.avatar
                      })) || []}
                      isSelected={selectedTaskId === task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setSelectedProjectId(task.projectId);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Colaboração da Tarefa Selecionada */}
            {selectedTask && selectedProject && (
              <div className="mt-6">
                <GenericCollaboration
                  contextId={selectedTask.id}
                  contextType="task"
                  contextTitle={`${selectedTask.title} - ${selectedProject.title}`}
                  membersIds={selectedTask.assignees}
                />
              </div>
            )}
          </TabsContent>

          {/* Atividades Gerais */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feed de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Aqui poderia ser implementado um feed global de atividades do Firebase */}
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Feed de Atividades em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    O feed global de atividades está sendo implementado com dados do Firebase.
                    Por enquanto, veja as atividades específicas em cada projeto e tarefa.
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
