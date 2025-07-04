// Tipos para colaboração e controle de permissões
import { Task, Project } from './project';

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
  permissions?: Permission[];
}

export interface Permission {
  resource: 'project' | 'task' | 'comment' | 'user';
  actions: PermissionAction[];
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'assign' | 'comment';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  mentions?: string[]; // IDs de usuários mencionados
  attachments?: Attachment[];
  reactions?: Reaction[];
  isEdited?: boolean;
  parentId?: string; // Para respostas
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_assigned' | 'task_completed' |
  'comment_added' | 'status_changed' | 'user_added' | 'user_removed' |
  'project_created' | 'project_updated' | 'deadline_changed';
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'project' | 'task' | 'comment';
  targetId: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Collaboration {
  comments: Comment[];
  activities: Activity[];
  permissions: ProjectPermission[];
}

export interface ProjectPermission {
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'collaborator' | 'viewer';
  permissions: Permission[];
  grantedBy: string;
  grantedAt: string;
}

// Roles padrão com suas permissões
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    {
      resource: 'project',
      actions: ['create', 'read', 'update', 'delete', 'assign']
    },
    {
      resource: 'task',
      actions: ['create', 'read', 'update', 'delete', 'assign', 'comment']
    },
    {
      resource: 'comment',
      actions: ['create', 'read', 'update', 'delete']
    },
    {
      resource: 'user',
      actions: ['create', 'read', 'update', 'delete', 'assign']
    }
  ],
  manager: [
    {
      resource: 'project',
      actions: ['create', 'read', 'update', 'assign']
    },
    {
      resource: 'task',
      actions: ['create', 'read', 'update', 'delete', 'assign', 'comment']
    },
    {
      resource: 'comment',
      actions: ['create', 'read', 'update', 'delete']
    },
    {
      resource: 'user',
      actions: ['read', 'assign']
    }
  ],
  member: [
    {
      resource: 'project',
      actions: ['read']
    },
    {
      resource: 'task',
      actions: ['create', 'read', 'update', 'comment']
    },
    {
      resource: 'comment',
      actions: ['create', 'read', 'update']
    },
    {
      resource: 'user',
      actions: ['read']
    }
  ],
  viewer: [
    {
      resource: 'project',
      actions: ['read']
    },
    {
      resource: 'task',
      actions: ['read', 'comment']
    },
    {
      resource: 'comment',
      actions: ['create', 'read']
    },
    {
      resource: 'user',
      actions: ['read']
    }
  ]
};

// Tipos estendidos com colaboração
export interface TaskWithCollaboration extends Task {
  comments?: Comment[];
  activities?: Activity[];
  watchers?: string[]; // IDs de usuários que seguem a tarefa
}

export interface ProjectWithCollaboration extends Project {
  collaboration?: Collaboration;
  watchers?: string[]; // IDs de usuários que seguem o projeto
}
