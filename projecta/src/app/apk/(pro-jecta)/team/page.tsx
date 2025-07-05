

"use client"

import React, { useState, useEffect } from 'react';
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
import { usePermissions } from '@/hooks/usePermissions';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { UserRole } from '@/types/collaboration';
import { formatLastActive, getRoleIcon, getRoleLabel, getRoleDescription, getPermissionsList } from '@/utils/userUtils';
import { cn } from '@/lib/utils';

interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  recentActivity: number;
}

export default function TeamPage() {
  const { currentUser, users, hasPermission, updateUserRole, removeUser } = usePermissions();
  const { logUserRemoved, logUserRoleChanged } = useActivityLogger();
  const { toast, showToast, hideToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros e pesquisa
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Estatísticas da equipe
  const teamStats: TeamStats = {
    totalMembers: users.length,
    activeMembers: users.filter(u => u.isActive).length,
    pendingInvitations: invitations.filter(i => i.status === 'pending').length,
    recentActivity: users.filter(u => {
      if (!u.lastActive) return false;
      const lastActive = new Date(u.lastActive);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return lastActive > yesterday;
    }).length
  };

  // Mock de convites pendentes
  useEffect(() => {
    setInvitations([
      {
        id: '1',
        email: 'carlos@example.com',
        role: 'member',
        invitedBy: currentUser?.name || 'Admin',
        invitedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 6 * 86400000).toISOString()
      },
      {
        id: '2',
        email: 'lucia@example.com',
        role: 'viewer',
        invitedBy: currentUser?.name || 'Admin',
        invitedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString()
      }
    ]);
  }, [currentUser]);

  const handleInviteUser = async () => {
    if (!inviteEmail || !hasPermission('user', 'create')) return;

    setIsLoading(true);
    
    try {
      // Simular convite por email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvitation: TeamInvitation = {
        id: Date.now().toString(),
        email: inviteEmail,
        role: inviteRole,
        invitedBy: currentUser?.name || 'Admin',
        invitedAt: new Date().toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
      };

      setInvitations(prev => [...prev, newInvitation]);
      
      showToast(`Convite enviado para ${inviteEmail} com a função de ${getRoleLabel(inviteRole)}.`, "success");

      setInviteEmail('');
      setInviteRole('member');
      setIsInviteModalOpen(false);
      
    } catch {
      showToast("Ocorreu um erro ao enviar o convite. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (user && hasPermission('user', 'update')) {
      updateUserRole(userId, newRole);
      logUserRoleChanged({
        userId: user.id,
        userName: user.name,
        projectId: 'current-project',
        projectTitle: 'Projeto Atual'
      }, newRole);
      
      showToast(`${user.name} agora é ${getRoleLabel(newRole)}.`, "success");
    }
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && hasPermission('user', 'delete') && user.id !== currentUser?.id) {
      removeUser(userId);
      logUserRemoved({
        userId: user.id,
        userName: user.name,
        projectId: 'current-project',
        projectTitle: 'Projeto Atual'
      });
      
      showToast(`${user.name} foi removido da equipe.`, "success");
    }
  };

  const cancelInvitation = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    showToast("O convite foi cancelado com sucesso.", "success");
  };

  return (
    <div className="container">
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

        {hasPermission('user', 'create') && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Convidar Membro
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
                />
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
                  disabled={!inviteEmail || isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
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
      {invitations.length > 0 && (
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
      )}

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className={cn(
                "flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-sm",
                !user.isActive && "opacity-60"
              )}>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {user.id === currentUser?.id && (
                        <Badge variant="secondary">Você</Badge>
                      )}
                      {!user.isActive && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Último acesso: {formatLastActive(user.lastActive)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Função atual */}
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      {getRoleIcon(user.role)}
                      <span className="font-medium">{getRoleLabel(user.role)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>

                  {/* Menu de ações */}
                  {hasPermission('user', 'update') && user.id !== currentUser?.id && (
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
                            onClick={() => handleRoleChange(user.id, role)}
                            disabled={role === 'admin' && currentUser?.role !== 'admin'}
                          >
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              {getRoleLabel(role)}
                              {user.role === role && <Crown className="h-3 w-3 ml-auto" />}
                            </div>
                          </DropdownMenuItem>
                        ))}
                        
                        {hasPermission('user', 'delete') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveUser(user.id)}
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
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro encontrado.</p>
              {searchQuery && (
                <p className="text-sm">Tente ajustar os filtros de pesquisa.</p>
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