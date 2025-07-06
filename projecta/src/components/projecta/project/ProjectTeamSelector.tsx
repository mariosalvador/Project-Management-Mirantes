"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, X, Users, Search } from "lucide-react";
import { TeamMember } from "@/types/project";
import { useInvites } from "@/hooks/useInvites";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectTeamSelectorProps {
  selectedMembers: TeamMember[];
  onMembersChange: (members: TeamMember[]) => void;
}

interface AvailableMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ProjectTeamSelector({
  selectedMembers,
  onMembersChange
}: ProjectTeamSelectorProps) {
  const { user } = useAuth();
  const { userInvitations, refetchUserInvites } = useInvites();

  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [memberRole, setMemberRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Carregar membros disponíveis baseado nos convites aceitos
  useEffect(() => {
    const loadAvailableMembers = async () => {
      if (!user?.email) return;

      setIsLoading(true);
      try {
        // Garantir que temos os convites mais recentes
        await refetchUserInvites();

        // Filtrar apenas convites aceitos e criar lista de membros disponíveis
        const acceptedInvites = userInvitations.filter(
          invite => invite.status === 'accepted'
        );

        // Mapa para evitar duplicatas baseado no email
        const membersMap = new Map<string, AvailableMember>();

        // Adicionar membros dos convites aceitos
        acceptedInvites.forEach(invite => {
          if (!membersMap.has(invite.email)) {
            membersMap.set(invite.email, {
              id: invite.email, // usar email como ID único
              name: invite.invitedByName || invite.email,
              email: invite.email,
              avatar: invite.invitedByName
                ? invite.invitedByName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                : invite.email.substring(0, 2).toUpperCase()
            });
          }
        });

        // Adicionar o usuário atual como disponível (se não estiver já)
        if (user.email && !membersMap.has(user.email)) {
          membersMap.set(user.email, {
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
            avatar: user.displayName
              ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
              : user.email.substring(0, 2).toUpperCase()
          });
        }

        // Converter mapa para array e filtrar membros já selecionados
        const allMembers = Array.from(membersMap.values());
        const filteredMembers = allMembers.filter(member =>
          !selectedMembers.find(selected =>
            selected.id === member.id || selected.id === member.email
          )
        );

        setAvailableMembers(filteredMembers);
      } catch (error) {
        console.error('Erro ao carregar membros disponíveis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableMembers();
  }, [user, userInvitations, selectedMembers, refetchUserInvites]);

  // Filtrar membros baseado no termo de busca
  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTeamMember = () => {
    if (!selectedMemberId || !memberRole) return;

    const selectedMember = availableMembers.find(member => member.id === selectedMemberId);
    if (!selectedMember) return;

    const newMember: TeamMember = {
      id: selectedMember.id,
      name: selectedMember.name,
      role: memberRole,
      avatar: selectedMember.avatar || selectedMember.name.substring(0, 2).toUpperCase()
    };

    onMembersChange([...selectedMembers, newMember]);

    // Resetar seleção
    setSelectedMemberId("");
    setMemberRole("");
  };

  const removeTeamMember = (memberId: string) => {
    const updatedMembers = selectedMembers.filter(member => member.id !== memberId);
    onMembersChange(updatedMembers);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipe do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seção para adicionar membros */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar membros da equipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="memberSelect">Selecionar Membro</Label>
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoading
                      ? "Carregando..."
                      : filteredMembers.length > 0
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
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredMembers.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas membros que aceitaram convites podem ser adicionados
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="memberRole">Função no Projeto</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">Gerente de Projeto</SelectItem>
                  <SelectItem value="lead-developer">Desenvolvedor Líder</SelectItem>
                  <SelectItem value="developer">Desenvolvedor</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="tester">Testador</SelectItem>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addTeamMember}
                className="w-full"
                disabled={!selectedMemberId || !memberRole || isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de membros selecionados */}
        {selectedMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Membros Selecionados:</Label>
            {selectedMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    {member.avatar}
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeamMember(member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {selectedMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum membro adicionado ao projeto ainda</p>
            <p className="text-sm">Selecione membros da sua equipe acima</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
