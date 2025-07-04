"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Clock
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/collaboration';
import { cn } from '@/lib/utils';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { formatLastActive, getPermissionsList, getRoleDescription, getRoleIcon, getRoleLabel } from '@/utils/userUtils';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const {
    currentUser,
    users,
    hasPermission,
    updateUserRole,
    removeUser
  } = usePermissions();

  // Hook para logging de atividades
  const { logUserRemoved, logUserRoleChanged } = useActivityLogger();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUserRole(userId, newRole);
      logUserRoleChanged({
        userId: user.id,
        userName: user.name,
        projectId: 'current-project', // Seria obtido do contexto real
        projectTitle: 'Projeto Atual' // Seria obtido do contexto real
      }, newRole);
    }
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      removeUser(userId);
      logUserRemoved({
        userId: user.id,
        userName: user.name,
        projectId: 'current-project', // Seria obtido do contexto real
        projectTitle: 'Projeto Atual' // Seria obtido do contexto real
      });
    }
  };


  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciar Usuários
          </h2>
          <p className="text-muted-foreground">
            Gerencie permissões e acesso dos usuários
          </p>
        </div>

        {hasPermission('user', 'create') && (
          <Button onClick={() => setIsAddUserOpen(!isAddUserOpen)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['admin', 'manager', 'member', 'viewer'] as UserRole[]).map((role) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getRoleIcon(role)}
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">
                      {getRoleLabel(role)}{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista de usuários */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className={cn(
            "transition-all",
            !user.isActive && "opacity-60"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {hasPermission('user', 'update') && user.id !== currentUser?.id && (
                      <div className="flex gap-1">
                        {(['viewer', 'member', 'manager', 'admin'] as UserRole[]).map((role) => (
                          <Button
                            key={role}
                            variant={user.role === role ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleRoleChange(user.id, role)}
                            disabled={role === 'admin' && currentUser?.role !== 'admin'}
                          >
                            {getRoleLabel(role)}
                          </Button>
                        ))}
                      </div>
                    )}

                    {hasPermission('user', 'delete') && user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissões detalhadas */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Permissões:</p>
                <div className="flex flex-wrap gap-1">
                  {getPermissionsList(user.role).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  );
}
