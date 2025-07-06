"use client"

import { useState, useContext, createContext, ReactNode, useEffect } from 'react';
import { User, UserRole, PermissionAction, DEFAULT_PERMISSIONS } from '../types/collaboration';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionContextType {
  currentUser: User | null;
  users: User[];
  hasPermission: (resource: string, action: PermissionAction, targetUserId?: string) => boolean;
  updateUserRole: (userId: string, role: UserRole) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  removeUser: (userId: string) => void;
  setCurrentUser: (user: User) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user, userData } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Sincronizar com dados de autenticação
  useEffect(() => {
    if (user && userData) {
      const authUser: User = {
        id: user.uid,
        name: userData.displayName || user.displayName || 'Usuário',
        email: userData.email || user.email || '',
        avatar: userData.photoURL || user.photoURL || undefined,
        role: 'admin', // Por padrão, primeiro usuário é admin - isso deveria vir do banco
        isActive: true,
        createdAt: userData.createdAt?.toISOString() || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: DEFAULT_PERMISSIONS.admin
      };

      setCurrentUser(authUser);
      setUsers([authUser]); // Por enquanto apenas o usuário logado
    }
  }, [user, userData]);

  const hasPermission = (
    resource: string,
    action: PermissionAction,
    targetUserId?: string
  ): boolean => {
    if (!currentUser) return false;

    // Admin sempre tem todas as permissões
    if (currentUser.role === 'admin') return true;

    // Verificar se o usuário tem a permissão específica
    const userPermissions = currentUser.permissions || DEFAULT_PERMISSIONS[currentUser.role];
    const resourcePermission = userPermissions.find(p => p.resource === resource);

    if (!resourcePermission) return false;

    // Verificar se tem a ação específica
    const hasAction = resourcePermission.actions.includes(action);

    // Regras especiais para edição própria
    if (targetUserId && targetUserId === currentUser.id) {
      // Usuários podem editar seus próprios comentários e perfil
      if (resource === 'comment' && action === 'update') return true;
      if (resource === 'user' && action === 'update') return true;
    }

    return hasAction;
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    if (!hasPermission('user', 'update')) return;

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, role, permissions: DEFAULT_PERMISSIONS[role] }
          : user
      )
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!hasPermission('user', 'create')) return;

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      permissions: DEFAULT_PERMISSIONS[userData.role]
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const removeUser = (userId: string) => {
    if (!hasPermission('user', 'delete')) return;

    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  const value: PermissionContextType = {
    currentUser,
    users,
    hasPermission,
    updateUserRole,
    addUser,
    removeUser,
    setCurrentUser
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}
