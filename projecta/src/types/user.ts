export interface UserRole {
  id: string
  name: string
  permissions: string[]
}

export interface UserPermissions {
  canCreateProject: boolean
  canEditProject: boolean
  canDeleteProject: boolean
  canManageTeam: boolean
  canManageTasks: boolean
  canViewAnalytics: boolean
  isAdmin: boolean
}

export interface ExtendedUser {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'admin' | 'manager' | 'member'
  permissions: UserPermissions
  createdAt: Date
  lastLoginAt: Date
  provider: 'email' | 'google'
}

// Definir permissões padrão por papel
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canManageTeam: true,
    canManageTasks: true,
    canViewAnalytics: true,
    isAdmin: true
  },
  manager: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canManageTeam: true,
    canManageTasks: true,
    canViewAnalytics: true,
    isAdmin: false
  },
  member: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canManageTasks: true,
    canViewAnalytics: false,
    isAdmin: false
  }
}

export const getUserPermissions = (role: string): UserPermissions => {
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.member
}
