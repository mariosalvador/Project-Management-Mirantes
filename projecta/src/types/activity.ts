export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_status_changed'
  | 'task_created'
  | 'task_updated'
  | 'task_status_changed'
  | 'task_assigned'
  | 'task_unassigned'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'user_added'
  | 'user_removed'
  | 'user_role_changed'
  | 'milestone_completed'
  | 'file_uploaded'
  | 'file_deleted';

export interface ActivityData {
  // Dados específicos para cada tipo de atividade
  oldValue?: string;
  newValue?: string;
  taskTitle?: string;
  projectTitle?: string;
  commentContent?: string;
  fileName?: string;
  userRole?: string;
  milestoneName?: string;
  taskCount?: number;
  changedFields?: string;
  assignedTo?: string;
  unassignedFrom?: string;
  userName?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  taskId?: string;
  targetUserId?: string; // Para atividades relacionadas a outros usuários
  data?: ActivityData;
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ActivityFilter {
  type?: ActivityType[];
  userId?: string;
  projectId?: string;
  taskId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  onlyUnread?: boolean;
}

export interface ActivityGrouped {
  date: string;
  activities: Activity[];
}

// Template para diferentes tipos de atividade
export const ACTIVITY_TEMPLATES: Record<ActivityType, {
  title: string;
  getDescription: (data: ActivityData) => string;
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
}> = {
  project_created: {
    title: 'Projeto criado',
    getDescription: (data) => `Projeto "${data.projectTitle}" foi criado com ${data.taskCount || 0} tarefas`,
    icon: '🚀',
    color: 'text-green-600 bg-green-50',
    priority: 'medium'
  },
  project_updated: {
    title: 'Projeto atualizado',
    getDescription: (data) => data.changedFields ? `"${data.projectTitle}" - Campos alterados: ${data.changedFields}` : `Projeto "${data.projectTitle}" foi atualizado`,
    icon: '📝',
    color: 'text-blue-600 bg-blue-50',
    priority: 'low'
  },
  project_status_changed: {
    title: 'Status do projeto alterado',
    getDescription: (data) => `"${data.projectTitle}" mudou de ${data.oldValue} para ${data.newValue}`,
    icon: '🔄',
    color: 'text-purple-600 bg-purple-50',
    priority: 'medium'
  },
  task_created: {
    title: 'Nova tarefa criada',
    getDescription: (data) => `"${data.taskTitle}" foi criada no projeto "${data.projectTitle}"`,
    icon: '✅',
    color: 'text-green-600 bg-green-50',
    priority: 'medium'
  },
  task_updated: {
    title: 'Tarefa atualizada',
    getDescription: (data) => `"${data.taskTitle}" foi modificada`,
    icon: '📝',
    color: 'text-blue-600 bg-blue-50',
    priority: 'low'
  },
  task_status_changed: {
    title: 'Status da tarefa alterado',
    getDescription: (data) => `"${data.taskTitle}" mudou de ${data.oldValue} para ${data.newValue}`,
    icon: '🔄',
    color: 'text-orange-600 bg-orange-50',
    priority: 'medium'
  },
  task_assigned: {
    title: 'Tarefa atribuída',
    getDescription: (data) => `"${data.taskTitle}" foi atribuída para ${data.assignedTo}`,
    icon: '👤',
    color: 'text-indigo-600 bg-indigo-50',
    priority: 'high'
  },
  task_unassigned: {
    title: 'Tarefa desatribuída',
    getDescription: (data) => `"${data.taskTitle}" não está mais atribuída para ${data.unassignedFrom}`,
    icon: '👤',
    color: 'text-gray-600 bg-gray-50',
    priority: 'low'
  },
  comment_added: {
    title: 'Novo comentário',
    getDescription: (data) => `Comentário adicionado em "${data.taskTitle}"`,
    icon: '💬',
    color: 'text-emerald-600 bg-emerald-50',
    priority: 'medium'
  },
  comment_updated: {
    title: 'Comentário editado',
    getDescription: (data) => `Comentário modificado em "${data.taskTitle}"`,
    icon: '✏️',
    color: 'text-yellow-600 bg-yellow-50',
    priority: 'low'
  },
  comment_deleted: {
    title: 'Comentário removido',
    getDescription: (data) => `Comentário removido de "${data.taskTitle}"`,
    icon: '🗑️',
    color: 'text-red-600 bg-red-50',
    priority: 'low'
  },
  user_added: {
    title: 'Novo membro adicionado',
    getDescription: (data) => `${data.userName} foi adicionado ao projeto como ${data.userRole}`,
    icon: '👥',
    color: 'text-green-600 bg-green-50',
    priority: 'medium'
  },
  user_removed: {
    title: 'Membro removido',
    getDescription: (data) => `${data.userName} foi removido do projeto`,
    icon: '👥',
    color: 'text-red-600 bg-red-50',
    priority: 'medium'
  },
  user_role_changed: {
    title: 'Função alterada',
    getDescription: (data) => `${data.userName} agora é ${data.newValue}`,
    icon: '🔐',
    color: 'text-purple-600 bg-purple-50',
    priority: 'medium'
  },
  milestone_completed: {
    title: 'Marco concluído',
    getDescription: (data) => `Marco "${data.milestoneName}" foi completado`,
    icon: '🎯',
    color: 'text-green-600 bg-green-50',
    priority: 'high'
  },
  file_uploaded: {
    title: 'Arquivo enviado',
    getDescription: (data) => `"${data.fileName}" foi enviado`,
    icon: '📎',
    color: 'text-blue-600 bg-blue-50',
    priority: 'low'
  },
  file_deleted: {
    title: 'Arquivo removido',
    getDescription: (data) => `"${data.fileName}" foi removido`,
    icon: '🗑️',
    color: 'text-red-600 bg-red-50',
    priority: 'low'
  }
};
