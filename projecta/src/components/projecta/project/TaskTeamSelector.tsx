"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, Search, UserCheck } from "lucide-react";
import { TeamMember } from "@/types/project";

interface TaskTeamSelectorProps {
  projectMembers: TeamMember[];
  selectedAssignees: string[];
  onAssigneesChange: (assignees: string[]) => void;
  taskTitle?: string;
}

export default function TaskTeamSelector({
  projectMembers,
  selectedAssignees,
  onAssigneesChange,
  taskTitle = "Tarefa"
}: TaskTeamSelectorProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtrar membros disponíveis (excluindo os já assignados)
  const availableMembers = projectMembers.filter(member =>
    !selectedAssignees.includes(member.id)
  );

  // Filtrar membros baseado no termo de busca
  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obter informações dos membros assignados
  const assignedMembers = selectedAssignees.map(assigneeId =>
    projectMembers.find(member => member.id === assigneeId)
  ).filter(Boolean) as TeamMember[];

  const addAssignee = () => {
    if (!selectedMemberId) return;

    const selectedMember = filteredMembers.find(member => member.id === selectedMemberId);
    if (!selectedMember) return;

    onAssigneesChange([...selectedAssignees, selectedMember.id]);
    setSelectedMemberId("");
  };

  const removeAssignee = (memberId: string) => {
    const updatedAssignees = selectedAssignees.filter(id => id !== memberId);
    onAssigneesChange(updatedAssignees);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Responsáveis pela {taskTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seção para adicionar responsáveis */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar membros do projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assigneeSelect">Selecionar Responsável</Label>
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    filteredMembers.length > 0
                      ? "Escolha um membro"
                      : "Nenhum membro disponível"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-primary text-primary-foreground text-xs">
                          {member.avatar}
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredMembers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {projectMembers.length === 0
                    ? "Nenhum membro adicionado ao projeto ainda"
                    : "Todos os membros já estão assignados"
                  }
                </p>
              )}
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addAssignee}
                className="w-full"
                disabled={!selectedMemberId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Responsável
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de responsáveis selecionados */}
        {assignedMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Responsáveis Selecionados:</Label>
            <div className="grid grid-cols-1 gap-2">
              {assignedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      {member.avatar}
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Responsável
                      </Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssignee(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignedMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum responsável atribuído ainda</p>
            <p className="text-sm">Selecione membros do projeto acima</p>
          </div>
        )}

        {/* Resumo */}
        {assignedMembers.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <UserCheck className="h-4 w-4" />
              <span className="font-medium">
                {assignedMembers.length} responsável{assignedMembers.length > 1 ? 'eis' : ''} atribuído{assignedMembers.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Todos os responsáveis receberão notificações sobre esta tarefa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
