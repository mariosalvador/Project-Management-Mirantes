"use client"

import { useState, useContext, createContext, ReactNode } from 'react';
import { User, UserRole, PermissionAction, DEFAULT_PERMISSIONS } from '../types/collaboration';

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

// Mock de usuários para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mario Salvador',
    email: 'mario@example.com',
    avatar: 'https://github.com/mariosalvador.png',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.admin
  },
  {
    id: '2',
    name: 'Ana Silva',
    email: 'ana@example.com',
    role: 'manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.manager
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@example.com',
    role: 'member',
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.member
  },
  {
    id: '4',
    name: 'Maria Costa',
    email: 'maria@example.com',
    role: 'viewer',
    isActive: true,
    createdAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.viewer
  }
];

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Admin por padrão
  const [users, setUsers] = useState<User[]>(mockUsers);

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
