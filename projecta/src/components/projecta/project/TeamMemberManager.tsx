"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Users, Search, UserPlus, Mail, AlertCircle } from "lucide-react";
import { TeamMember } from "@/types/project";
import { useUserMembers } from "@/hooks/useUserMembers";
import { UserRole } from "@/types/collaboration";
import { toast } from "sonner";

interface TeamMemberManagerProps {
  selectedMembers: TeamMember[];
  onMembersChange: (members: TeamMember[]) => void;
  title?: string;
  description?: string;
  allowInvites?: boolean;
  roleOptions?: Array<{ value: string; label: string }>;
  maxMembers?: number;
}

const defaultRoleOptions = [
  { value: "project-manager", label: "Gerente de Projeto" },
  { value: "lead-developer", label: "Desenvolvedor Líder" },
  { value: "developer", label: "Desenvolvedor" },
  { value: "designer", label: "Designer" },
  { value: "tester", label: "Testador" },
  { value: "analyst", label: "Analista" },
  { value: "stakeholder", label: "Stakeholder" },
  { value: "other", label: "Outro" }
];

export default function TeamMemberManager({
  selectedMembers,
  onMembersChange,
  title = "Equipe",
  description = "Selecione os membros da equipe",
  allowInvites = true,
  roleOptions = defaultRoleOptions,
  maxMembers
}: TeamMemberManagerProps) {
  const {
    members: userMembers,
    isLoading: loadingMembers,
    sendInvite,
    error
  } = useUserMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [memberRole, setMemberRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Filtrar membros disponíveis (excluindo os já selecionados)
  const availableMembers = userMembers.filter(member =>
    !selectedMembers.find(selected =>
      selected.id === member.memberUserId || selected.id === member.memberEmail
    )
  );

  // Filtrar membros baseado no termo de busca
  const filteredMembers = availableMembers.filter(member =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTeamMember = () => {
    if (!selectedMemberId || !memberRole) return;

    // Verificar limite de membros
    if (maxMembers && selectedMembers.length >= maxMembers) {
      toast.error(`Limite máximo de ${maxMembers} membros atingido`);
      return;
    }

    const selectedMember = filteredMembers.find(member => member.memberUserId === selectedMemberId);
    if (!selectedMember) return;

    const newMember: TeamMember = {
      id: selectedMember.memberUserId,
      name: selectedMember.memberName,
      role: memberRole,
      avatar: selectedMember.memberAvatar || selectedMember.memberName.substring(0, 2).toUpperCase()
    };

    onMembersChange([...selectedMembers, newMember]);

    // Resetar seleção
    setSelectedMemberId("");
    setMemberRole("");
    toast.success(`${selectedMember.memberName} adicionado à equipe`);
  };

  const removeTeamMember = (memberId: string) => {
    const memberToRemove = selectedMembers.find(m => m.id === memberId);
    const updatedMembers = selectedMembers.filter(member => member.id !== memberId);
    onMembersChange(updatedMembers);

    if (memberToRemove) {
      toast.success(`${memberToRemove.name} removido da equipe`);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    setIsInviting(true);
    try {
      const success = await sendInvite(inviteEmail, inviteRole, inviteMessage);

      if (success) {
        toast.success(`Convite enviado para ${inviteEmail}`);
        setInviteEmail("");
        setInviteMessage("");
        setInviteRole("member");
        setShowInviteForm(false);
      } else {
        toast.error("Erro ao enviar convite");
      }
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast.error("Erro ao enviar convite");
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleLabel = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
          {maxMembers && (
            <Badge variant="outline" className="ml-2">
              {selectedMembers.length}/{maxMembers}
            </Badge>
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seção para adicionar membros */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Adicionar Membros</h4>
            {allowInvites && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInviteForm(!showInviteForm)}
                disabled={loadingMembers}
              >
                <Mail className="h-4 w-4 mr-2" />
                Convidar Novo
              </Button>
            )}
          </div>

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
                disabled={loadingMembers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingMembers
                      ? "Carregando..."
                      : filteredMembers.length > 0
                        ? "Escolha um membro"
                        : "Nenhum membro disponível"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredMembers.map((member) => (
                    <SelectItem key={member.memberUserId} value={member.memberUserId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-primary text-primary-foreground text-xs">
                          {member.memberAvatar || member.memberName.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{member.memberName}</div>
                          <div className="text-xs text-muted-foreground">{member.memberEmail}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredMembers.length === 0 && !loadingMembers && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nenhum membro disponível na sua equipe
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="memberRole">Função</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addTeamMember}
                className="w-full"
                disabled={!selectedMemberId || !memberRole || loadingMembers || Boolean(maxMembers && selectedMembers.length >= maxMembers)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Formulário de convite */}
          {showInviteForm && allowInvites && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Convidar Novo Membro
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inviteEmail">Email do Convidado</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteRole">Função Padrão</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="inviteMessage">Mensagem (opcional)</Label>
                  <Input
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Convite para participar do projeto..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSendInvite}
                    disabled={isInviting || !inviteEmail.trim()}
                  >
                    {isInviting ? "Enviando..." : "Enviar Convite"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mostrar erro se houver */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

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
                    <div className="text-sm text-muted-foreground">{getRoleLabel(member.role)}</div>
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
            <p>Nenhum membro adicionado ainda</p>
            <p className="text-sm">Selecione membros da sua equipe acima</p>
          </div>
        )}

        {/* Resumo */}
        {selectedMembers.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                {selectedMembers.length} membro{selectedMembers.length > 1 ? 's' : ''} selecionado{selectedMembers.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Todos os membros receberão notificações sobre este projeto
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
