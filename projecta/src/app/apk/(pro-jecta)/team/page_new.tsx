"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast, Toast } from '@/components/ui/toast';
import {
  Users,
  UserPlus,
  Mail,
  Send,
  Clock,
  Crown,
  MoreVertical,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useInvites } from '@/hooks/useInvites';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { UserRole } from '@/types/collaboration';
import { formatLastActive, getRoleIcon, getRoleLabel, getRoleDescription, getPermissionsList } from '@/utils/userUtils';
import { cn } from '@/lib/utils';

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  recentActivity: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { logUserRemoved, logUserRoleChanged } = useActivityLogger();
  const { toast, showToast, hideToast } = useToast();

  // Em produção, isso viria do contexto do projeto ou da URL
  // Por enquanto, vamos usar um projeto padrão baseado no usuário
  const projectId = user?.uid ? `project-${user.uid}` : 'demo-project';
  const projectTitle = 'Projeto Principal';

  // Hook para membros reais do projeto
  const {
    members,
    currentMember,
    currentUserRole,
    stats: memberStats,
    hasPermission,
    updateRole,
    removeMember
  } = useProjectMembers(projectId);

  // Debug logs
  console.log('Team Page Debug:', {
    projectId,
    currentUserRole,
    hasCreatePermission: hasPermission('create'),
    membersCount: members.length,
    currentMember
  });

  // Verificar se o usuário é o dono do projeto (baseado no projectId)
  const isProjectOwner = () => {
    return projectId === `project-${user?.uid}`;
  };

  // Verificar se o usuário pode convidar (dono do projeto OU tem permissão)
  const canInvite = () => {
    return isProjectOwner() || hasPermission('create');
  };

  const {
    invitations,
    sendInvite,
    cancelInvite: handleCancelInvite,
    isLoading: inviteLoading,
    error: inviteError
  } = useInvites(projectId);

  // Log de erro apenas se houver erro
  if (inviteError) {
    console.error('Erro ao carregar convites:', inviteError);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');

  // Filtros e pesquisa
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Estatísticas da equipe (usando dados reais)
  const teamStats: TeamStats = {
    totalMembers: memberStats.total,
    activeMembers: memberStats.active,
    pendingInvitations: invitations.length,
    recentActivity: memberStats.recentActivity
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !canInvite()) return;

    // Validação: impedir auto-convite
    if (currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim()) {
      showToast("Você não pode enviar um convite para si mesmo.", "error");
      return;
    }

    // Também verificar com o email do usuário logado se não há currentMember
    if (!currentMember && user?.email && inviteEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) {
      showToast("Você não pode enviar um convite para si mesmo.", "error");
      return;
    }

    try {
      const success = await sendInvite(inviteEmail, inviteRole, projectTitle);

      if (success) {
        showToast(`Convite enviado para ${inviteEmail} com a função de ${getRoleLabel(inviteRole)}.`, "success");
        setInviteEmail('');
        setInviteRole('member');
        setIsInviteModalOpen(false);
      } else {
        showToast("Ocorreu um erro ao enviar o convite. Tente novamente.", "error");
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      showToast("Ocorreu um erro ao enviar o convite. Tente novamente.", "error");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    const member = members.find(m => m.id === memberId);
    if (member && (hasPermission('update') || isProjectOwner())) {
      const success = await updateRole(memberId, newRole);
      if (success) {
        logUserRoleChanged({
          userId: member.userId,
          userName: member.name,
          projectId: projectId,
          projectTitle: projectTitle
        }, newRole);

        showToast(`${member.name} agora é ${getRoleLabel(newRole)}.`, "success");
      } else {
        showToast("Erro ao alterar função do membro.", "error");
      }
    }
  };

  const handleRemoveUser = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member && (hasPermission('delete') || isProjectOwner()) && member.userId !== currentMember?.userId && member.userId !== user?.uid) {
      const success = await removeMember(memberId);
      if (success) {
        logUserRemoved({
          userId: member.userId,
          userName: member.name,
          projectId: projectId,
          projectTitle: projectTitle
        });

        showToast(`${member.name} foi removido da equipe.`, "success");
      } else {
        showToast("Erro ao remover membro da equipe.", "error");
      }
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const success = await handleCancelInvite(invitationId);
      if (success) {
        showToast("O convite foi cancelado com sucesso.", "success");
      } else {
        showToast("Erro ao cancelar convite.", "error");
      }
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      showToast("Erro ao cancelar convite.", "error");
    }
  };

  return (
    <div className="container space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Gerenciar Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie membros, convites e permissões da equipe
          </p>
        </div>

        {(canInvite() || currentUserRole === null) && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="gap-2"
            disabled={currentUserRole === null && !isProjectOwner()}
          >
            <UserPlus className="h-4 w-4" />
            {currentUserRole === null && !isProjectOwner() ? 'Carregando...' : 'Convidar Membro'}
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
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
                <p className="text-2xl font-bold">{teamStats.activeMembers}</p>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Mail className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.pendingInvitations}</p>
                <p className="text-sm text-muted-foreground">Convites Pendentes</p>
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
                <p className="text-2xl font-bold">{teamStats.recentActivity}</p>
                <p className="text-sm text-muted-foreground">Ativos Hoje</p>
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

      {/* Modal de Convite */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Convidar Novo Membro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email do membro</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={
                    (currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim()) ||
                      (user?.email && inviteEmail.toLowerCase().trim() === user.email.toLowerCase().trim())
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
                {((currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim()) ||
                  (user?.email && inviteEmail.toLowerCase().trim() === user.email.toLowerCase().trim())) && (
                    <p className="text-sm text-red-500 mt-1">
                      Você não pode enviar um convite para si mesmo
                    </p>
                  )}
              </div>

              <div>
                <Label htmlFor="role">Função</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(inviteRole)}
                        {getRoleLabel(inviteRole)}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(['viewer', 'member', 'manager'] as UserRole[]).map((role) => (
                      <DropdownMenuItem key={role} onClick={() => setInviteRole(role)}>
                        <div className="flex items-center gap-2 w-full">
                          {getRoleIcon(role)}
                          <div>
                            <div className="font-medium">{getRoleLabel(role)}</div>
                            <div className="text-xs text-muted-foreground">
                              {getRoleDescription(role)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={
                    !inviteEmail ||
                    inviteLoading ||
                    Boolean((currentMember?.email && inviteEmail.toLowerCase().trim() === currentMember.email.toLowerCase().trim()) ||
                      (user?.email && inviteEmail.toLowerCase().trim() === user.email.toLowerCase().trim()))
                  }
                  className="flex-1 gap-2"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Convites Pendentes */}
      {invitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Convidado como {getRoleLabel(invitation.role)} • {formatLastActive(invitation.invitedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Pendente</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (canInvite() || currentUserRole === null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum convite pendente.</p>
              <p className="text-sm">Convide novos membros para a equipe usando o botão acima.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Membros da Equipe - Aqui estão os membros que aceitaram convites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe ({filteredMembers.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Todos os membros que aceitaram convites e fazem parte da equipe
          </p>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const isOwner = projectId === `project-${member.userId}`;
                const joinedRecently = new Date(member.joinedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                return (
                  <div key={member.id} className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-sm",
                    !member.isActive && "opacity-60",
                    joinedRecently && "border-green-200 bg-green-50/50"
                  )}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          {member.userId === currentMember?.userId && (
                            <Badge variant="secondary">Você</Badge>
                          )}
                          {isOwner && (
                            <Badge variant="default" className="bg-blue-600">
                              <Crown className="h-3 w-3 mr-1" />
                              Dono do Projeto
                            </Badge>
                          )}
                          {joinedRecently && !isOwner && (
                            <Badge variant="default" className="bg-green-600">
                              Novo Membro
                            </Badge>
                          )}
                          {!member.isActive && (
                            <Badge variant="destructive">Inativo</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Último acesso: {formatLastActive(member.lastActive)}
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3" />
                            Membro desde: {formatLastActive(member.joinedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Função atual */}
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          {getRoleIcon(member.role)}
                          <span className="font-medium">{getRoleLabel(member.role)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getRoleDescription(member.role)}
                        </p>
                      </div>

                      {/* Menu de ações */}
                      {(hasPermission('update') || isProjectOwner()) && member.userId !== currentMember?.userId && member.userId !== user?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Alterar função</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(['viewer', 'member', 'manager', 'admin'] as UserRole[]).map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleRoleChange(member.id, role)}
                                disabled={role === 'admin' && currentUserRole !== 'admin' && !isProjectOwner()}
                              >
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role)}
                                  {getRoleLabel(role)}
                                  {member.role === role && <Crown className="h-3 w-3 ml-auto" />}
                                </div>
                              </DropdownMenuItem>
                            ))}

                            {(hasPermission('delete') || isProjectOwner()) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveUser(member.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Remover da equipe
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro encontrado.</p>
              {searchQuery ? (
                <p className="text-sm">Tente ajustar os filtros de pesquisa.</p>
              ) : (
                <p className="text-sm">
                  {(hasPermission('create') || isProjectOwner())
                    ? 'Convide novos membros para começar a colaborar.'
                    : 'Não há membros na equipe no momento.'
                  }
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                    <div key={permission} className="text-xs text-muted-foreground">
                      • {permission}
                    </div>
                  ))}
                  {getPermissionsList(role).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{getPermissionsList(role).length - 3} mais...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
