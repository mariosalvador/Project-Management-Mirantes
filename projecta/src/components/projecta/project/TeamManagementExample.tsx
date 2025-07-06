"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMember } from "@/types/project";
import TeamMemberManager from "./TeamMemberManager";
import TaskTeamSelector from "./TaskTeamSelector";
import { Users, ListTodo, Info } from "lucide-react";

export default function TeamManagementExample() {
  const [projectMembers, setProjectMembers] = useState<TeamMember[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<string[]>([]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestão de Equipes</h1>
        <p className="text-muted-foreground">
          Demonstração dos componentes para gerenciar membros de projetos e tarefas
        </p>
      </div>

      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="project" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Projeto
          </TabsTrigger>
          <TabsTrigger value="task" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Tarefa
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TeamMemberManager
                selectedMembers={projectMembers}
                onMembersChange={setProjectMembers}
                title="Equipe do Projeto"
                description="Adicione membros que participarão deste projeto"
                allowInvites={true}
                maxMembers={10}
              />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de membros:</span>
                      <span className="font-semibold">{projectMembers.length}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Funções:</span>
                      {projectMembers.length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(
                            projectMembers.reduce((acc, member) => {
                              acc[member.role] = (acc[member.role] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([role, count]) => (
                            <div key={role} className="flex justify-between text-sm">
                              <span className="capitalize">{role.replace('-', ' ')}</span>
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum membro adicionado</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="task" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TaskTeamSelector
                projectMembers={projectMembers}
                selectedAssignees={taskAssignees}
                onAssigneesChange={setTaskAssignees}
                taskTitle="Implementar Nova Funcionalidade"
              />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Tarefa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Responsáveis:</span>
                      <span className="font-semibold">{taskAssignees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Membros disponíveis:</span>
                      <span className="font-semibold">{projectMembers.length}</span>
                    </div>

                    {taskAssignees.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Membros atribuídos:</span>
                        <div className="space-y-1">
                          {taskAssignees.map(assigneeId => {
                            const member = projectMembers.find(m => m.id === assigneeId);
                            return member ? (
                              <div key={assigneeId} className="flex justify-between text-sm">
                                <span>{member.name}</span>
                                <span className="text-muted-foreground">{member.role}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {projectMembers.length === 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          Adicione membros ao projeto primeiro para poder atribuí-los às tarefas.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Projetos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-medium">Recursos:</h4>
                <ul className="space-y-2 text-sm">
                  <li>✅ Adicionar membros da equipe existente</li>
                  <li>✅ Convidar novos membros por email</li>
                  <li>✅ Definir funções específicas</li>
                  <li>✅ Limite máximo de membros</li>
                  <li>✅ Busca e filtragem</li>
                  <li>✅ Notificações automáticas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="font-medium">Recursos:</h4>
                <ul className="space-y-2 text-sm">
                  <li>✅ Atribuir múltiplos responsáveis</li>
                  <li>✅ Apenas membros do projeto</li>
                  <li>✅ Interface intuitiva</li>
                  <li>✅ Visualização de status</li>
                  <li>✅ Remoção fácil</li>
                  <li>✅ Notificações para responsáveis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Como usar nos seus componentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Para Projetos:</h4>
                  <code className="text-sm">
                    {`<TeamMemberManager
  selectedMembers={projectMembers}
  onMembersChange={setProjectMembers}
  title="Equipe do Projeto"
  allowInvites={true}
  maxMembers={10}
/>`}
                  </code>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Para Tarefas:</h4>
                  <code className="text-sm">
                    {`<TaskTeamSelector
  projectMembers={projectMembers}
  selectedAssignees={taskAssignees}
  onAssigneesChange={setTaskAssignees}
  taskTitle="Nome da Tarefa"
/>`}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
