// Tipos para o sistema de feed de atividades

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

// Mock de atividades para demonstração
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'project_created',
    title: 'Projeto "Website Redesign" criado',
    description: 'Novo projeto foi criado com 5 tarefas',
    userId: '1',
    userName: 'Mario Salvador',
    userAvatar: 'https://github.com/mariosalvador.png',
    projectId: '1',
    data: {
      projectTitle: 'Website Redesign',
      taskCount: 5
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    isRead: false,
    priority: 'medium'
  },
  {
    id: '2',
    type: 'task_status_changed',
    title: 'Status da tarefa alterado',
    description: '"Análise de requisitos" mudou de ativo para concluído',
    userId: '2',
    userName: 'Ana Silva',
    projectId: '1',
    taskId: '1',
    data: {
      taskTitle: 'Análise de requisitos',
      projectTitle: 'Website Redesign',
      oldValue: 'ativo',
      newValue: 'concluído'
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
    isRead: true,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'comment_added',
    title: 'Novo comentário',
    description: 'Comentário adicionado em "Criação do wireframe"',
    userId: '3',
    userName: 'João Santos',
    projectId: '1',
    taskId: '2',
    data: {
      taskTitle: 'Criação do wireframe',
      projectTitle: 'Website Redesign',
      commentContent: 'Revisei os wireframes e estão aprovados'
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
    isRead: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'task_assigned',
    title: 'Tarefa atribuída',
    description: '"Desenvolvimento da API" foi atribuída para Carlos Santos',
    userId: '1',
    userName: 'Mario Salvador',
    projectId: '1',
    taskId: '3',
    data: {
      taskTitle: 'Desenvolvimento da API',
      projectTitle: 'Website Redesign',
      assignedTo: 'Carlos Santos'
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 horas atrás
    isRead: true,
    priority: 'high'
  },
  {
    id: '5',
    type: 'user_added',
    title: 'Novo membro adicionado',
    description: 'Petra Lima foi adicionada ao projeto como QA Tester',
    userId: '1',
    userName: 'Mario Salvador',
    projectId: '1',
    data: {
      userName: 'Petra Lima',
      userRole: 'QA Tester',
      projectTitle: 'Website Redesign'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    isRead: true,
    priority: 'medium'
  },
  {
    id: '6',
    type: 'milestone_completed',
    title: 'Marco concluído',
    description: 'Marco "Aprovação do Design" foi completado',
    userId: '2',
    userName: 'Ana Silva',
    projectId: '1',
    data: {
      milestoneName: 'Aprovação do Design',
      projectTitle: 'Website Redesign'
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    isRead: true,
    priority: 'high'
  }
];
