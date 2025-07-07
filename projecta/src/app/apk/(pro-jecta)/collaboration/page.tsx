"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  Target,
  AlertTriangle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, PageSection } from '@/components/ui/responsive-container';
import { GenericCollaboration } from '@/components/projecta/Collaboration/generic-collaboration';
import { TaskCard } from '@/components/projecta/Collaboration/task-card';
import { EmptyState } from '@/components/projecta/Collaboration/empty-state';
import { useCollaborationData } from '@/hooks/useCollaborationData';
import { useAuth } from '@/contexts/AuthContext';

export default function CollaborationPage() {
  const { user } = useAuth();
  const {
    userProjects,
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
      task.assignees.includes(user?.email || '') ||
      task.assignees.includes(user?.displayName || '')
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
          description="Projetos e tarefas onde você participa como membro da equipe"
          action={
            <div className="text-sm text-muted-foreground">
              {user?.email && <span>Conectado como: {user.email}</span>}
            </div>
          }
        />


        {/* Navegação Principal */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as typeof activeView)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Minhas Tarefas
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
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {project.status === 'completed' ? 'Concluído' :
                                project.status === 'active' ? 'Ativo' :
                                  project.status === 'planning' ? 'Planejamento' : 'Pausado'}
                            </span>
                            <Link href={`/apk/collaboration/${project.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Função: {project.userRole || 'Membro'}</span>
                          <span>Tarefas: {project.tasks?.length || 0}</span>
                          <span>Minhas tarefas: {
                            project.tasks?.filter(task =>
                              task.assignees.includes(user?.email || '') ||
                              task.assignees.includes(user?.displayName || '')
                            ).length || 0
                          }</span>
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
                  const canEditTask = task.assignees.includes(user?.email || '') ||
                    task.assignees.includes(user?.displayName || '') ||
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
        </Tabs>

        {/* Debug Section - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed border-yellow-400 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 text-sm">🐛 Debug - Colaboração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Email do usuário:</span> {user?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Nome do usuário:</span> {user?.displayName || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Projetos carregados:</span> {userProjects.length}
              </div>
              <div>
                <span className="font-medium">Estado loading:</span> {loading ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">Erro:</span> {error || 'Nenhum'}
              </div>

              {userProjects.map(project => (
                <div key={project.id} className="border rounded p-2 bg-white">
                  <div><strong>Projeto:</strong> {project.title}</div>
                  <div><strong>Role:</strong> {project.userRole}</div>
                  <div><strong>Tasks:</strong> {project.tasks?.length || 0}</div>
                  <div><strong>Minhas Tasks:</strong> {
                    project.tasks?.filter(task =>
                      task.assignees.includes(user?.email || '') ||
                      task.assignees.includes(user?.displayName || '')
                    ).length || 0
                  }</div>
                  <div className="text-xs text-gray-600">
                    <strong>Team:</strong> {JSON.stringify(project.team?.map(t => ({ name: t.name, email: t.email })))}
                  </div>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                className="mt-2"
              >
                🔄 Recarregar Dados
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
}
