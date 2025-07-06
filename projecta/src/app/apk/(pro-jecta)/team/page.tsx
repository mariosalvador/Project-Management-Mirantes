"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast, Toast } from '@/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  MoreVertical,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Activity,
  Calendar,
  Mail,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMembers, useProjectMemberManagement } from '@/hooks/useUserMembers';
import { UserRole } from '@/types/collaboration';
import { formatLastActive, getRoleIcon, getRoleLabel, getRoleDescription, getPermissionsList } from '@/utils/userUtils';
import { cn } from '@/lib/utils';

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  availableMembers: number;
  projectMembers: number;
  pendingInvites: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const projectId = user?.uid ? `project-${user.uid}` : 'demo-project';

  // Hook para membros do usuário
  const {
    members: userMembers,
    sentInvites,
    stats: memberStats,
    sendInvite,
    isLoading: userMembersLoading,
    error: userMembersError
  } = useUserMembers();

  // Hook para gerenciar membros no projeto
  const {
    projectMembers,
    availableMembers,
    isLoading: projectLoading,
    addMemberToProject,
    removeMemberFromProject
  } = useProjectMemberManagement(projectId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMemberRole, setSelectedMemberRole] = useState<UserRole>('member');

  // Estados para convite de membros
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [inviteMessage, setInviteMessage] = useState('');

  // Filtros e pesquisa
  const filteredProjectMembers = projectMembers.filter(member => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.assignedRole === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Estatísticas da equipe
  const teamStats: TeamStats = {
    totalMembers: memberStats.total,
    activeMembers: memberStats.active,
    availableMembers: availableMembers.length,
    projectMembers: projectMembers.length,
    pendingInvites: sentInvites.length
  };

  const handleAddMemberToProject = async (memberUserId: string) => {
    const success = await addMemberToProject(memberUserId, selectedMemberRole);
    if (success) {
      const member = userMembers.find(m => m.memberUserId === memberUserId);
      if (member) {
        showToast(`${member.memberName} foi adicionado ao projeto como ${getRoleLabel(selectedMemberRole)}.`, "success");
      }
      setIsAddMemberModalOpen(false);
    } else {
      showToast("Erro ao adicionar membro ao projeto.", "error");
    }
  };

  const handleRemoveMemberFromProject = async (memberUserId: string) => {
    const member = projectMembers.find(m => m.memberUserId === memberUserId);
    if (member) {
      const success = await removeMemberFromProject(memberUserId);
      if (success) {
        showToast(`${member.memberName} foi removido do projeto.`, "success");
      } else {
        showToast("Erro ao remover membro do projeto.", "error");
      }
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      showToast("Por favor, insira um email válido.", "error");
      return;
    }

    console.log('Dados do usuário antes do envio:', {
      uid: user?.uid,
      displayName: user?.displayName,
      email: user?.email,
      inviteEmail: inviteEmail.trim(),
      inviteRole
    });

    try {
      const success = await sendInvite(inviteEmail.trim(), inviteRole, inviteMessage.trim() || undefined);
      if (success) {
        showToast(`Convite enviado para ${inviteEmail} com sucesso!`, "success");
        setShowInviteDialog(false);
        setInviteEmail('');
        setInviteRole('member');
        setInviteMessage('');
      } else {
        // Mostrar erro específico do hook se disponível
        const errorMsg = userMembersError || "Erro ao enviar convite. Tente novamente.";
        showToast(errorMsg, "error");
        console.error('Erro ao enviar convite:', userMembersError);
      }
    } catch (error) {
      console.error('Erro não capturado no handleSendInvite:', error);
      showToast("Erro inesperado ao enviar convite.", "error");
    }
  };

  return (
    <div className="container space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Gerenciar Projeto
          </h1>
          <p className="text-muted-foreground mt-1">
            Adicione seus membros aos projetos e gerencie permissões
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowInviteDialog(true)}
          >
            <Mail className="h-4 w-4" />
            Convidar Membro
          </Button>

          {availableMembers.length > 0 && (
            <Button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar ao Projeto
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Meus Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.projectMembers}</p>
                <p className="text-sm text-muted-foreground">No Projeto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.availableMembers}</p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mail className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.pendingInvites}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.activeMembers}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Pesquisa */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedRole === 'all' ? 'Todas as funções' : getRoleLabel(selectedRole)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedRole('all')}>
                    Todas as funções
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {(['admin', 'manager', 'member', 'viewer'] as UserRole[]).map((role) => (
                    <DropdownMenuItem key={role} onClick={() => setSelectedRole(role)}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        {getRoleLabel(role)}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Adicionar Membro */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Adicionar Membro ao Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">Função no projeto</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(selectedMemberRole)}
                        {getRoleLabel(selectedMemberRole)}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(['viewer', 'member', 'manager', 'admin'] as UserRole[]).map((role) => (
                      <DropdownMenuItem key={role} onClick={() => setSelectedMemberRole(role)}>
                        <div className="flex items-center gap-2 w-full">
                          {getRoleIcon(role)}
                          <div>
                            <div className="font-medium">{getRoleLabel(role)}</div>
                            <div className="text-xs text-muted-foreground">{getRoleDescription(role)}</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <Label>Selecionar membro</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {member.memberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.memberName}</p>
                          <p className="text-xs text-muted-foreground">{member.memberEmail}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMemberToProject(member.memberUserId)}
                        disabled={projectLoading}
                      >
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Membros do Projeto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros do Projeto ({filteredProjectMembers.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Membros atribuídos a este projeto
          </p>
        </CardHeader>
        <CardContent>
          {filteredProjectMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredProjectMembers.map((member) => {
                const assignedRecently = new Date(member.assignedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                return (
                  <div key={member.id} className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-sm",
                    !member.isActive && "opacity-60",
                    assignedRecently && "border-green-200 bg-green-50/50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {member.memberName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{member.memberName}</h3>
                          {assignedRecently && (
                            <Badge variant="secondary" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.memberEmail}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getRoleIcon(member.assignedRole)}
                            {getRoleLabel(member.assignedRole)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Adicionado em {formatLastActive(member.assignedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMemberFromProject(member.memberUserId)}
                            className="text-destructive"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remover do projeto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro no projeto.</p>
              {searchQuery ? (
                <p className="text-sm">Tente ajustar os filtros de pesquisa.</p>
              ) : availableMembers.length > 0 ? (
                <p className="text-sm">
                  Adicione seus membros ao projeto para colaborar em tarefas.
                </p>
              ) : (
                <div className="text-sm">
                  <p>Você não tem membros disponíveis.</p>
                  <Button
                    variant="link"
                    onClick={() => setShowInviteDialog(true)}
                    className="p-0 h-auto text-sm"
                  >
                    Convide pessoas para se tornarem seus membros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {sentInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes ({sentInvites.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Convites enviados aguardando resposta
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{invite.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(invite.defaultRole)}
                          {getRoleLabel(invite.defaultRole)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Enviado em {new Date(invite.invitedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Pendente
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre Membros Disponíveis */}
      {availableMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Membros Disponíveis ({availableMembers.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Seus membros que podem ser adicionados a este projeto
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableMembers.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {member.memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.memberName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getRoleIcon(member.defaultRole)}
                      {getRoleLabel(member.defaultRole)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {availableMembers.length > 6 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                E mais {availableMembers.length - 6} membros disponíveis...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permissões Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Níveis de Permissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['admin', 'manager', 'member', 'viewer'] as UserRole[]).map((role) => (
              <div key={role} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {getRoleIcon(role)}
                  <h4 className="font-semibold">{getRoleLabel(role)}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {getRoleDescription(role)}
                </p>
                <div className="space-y-1">
                  {getPermissionsList(role).slice(0, 3).map((permission) => (
                    <div key={permission} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      {permission}
                    </div>
                  ))}
                  {getPermissionsList(role).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{getPermissionsList(role).length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Convite */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Novo Membro</DialogTitle>
            <DialogDescription>
              Envie um convite para que alguém se torne membro da sua equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email do convidado</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="role">Função padrão</Label>
              <Select value={inviteRole} onValueChange={(value: UserRole) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">👁️ Visualizador</SelectItem>
                  <SelectItem value="member">👤 Membro</SelectItem>
                  <SelectItem value="manager">⭐ Gerente</SelectItem>
                  <SelectItem value="admin">🛡️ Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem personalizada ao convite..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || userMembersLoading}
              className="gap-2"
            >
              {userMembersLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast de notificações */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
