import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationSettings, NotificationFilter, NotificationStats } from '@/types/notification';
import { Task, Project } from '@/types/project';

// Mock de dados para demonstração
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_deadline',
    title: 'Prazo se aproximando',
    message: 'A tarefa "Criação do wireframe" vence em 2 dias',
    userId: 'user1',
    projectId: '1',
    taskId: '2',
    isRead: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    dueDate: '2025-07-06',
    actionUrl: '/apk/project/Website%20Redesign/tasks/manage?taskId=2',
    metadata: {
      daysUntilDue: 2
    }
  },
  {
    id: '2',
    type: 'task_status_change',
    title: 'Status da tarefa alterado',
    message: 'A tarefa "Análise de requisitos" foi marcada como concluída',
    userId: 'user1',
    projectId: '1',
    taskId: '1',
    isRead: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    actionUrl: '/apk/project/Website%20Redesign/tasks',
    metadata: {
      oldStatus: 'active',
      newStatus: 'completed'
    }
  },
  {
    id: '3',
    type: 'task_assignment',
    title: 'Nova tarefa atribuída',
    message: 'Você foi atribuído à tarefa "Desenvolvimento da API"',
    userId: 'user1',
    projectId: '1',
    taskId: '3',
    isRead: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
    actionUrl: '/apk/project/Website%20Redesign/tasks/manage?taskId=3',
    metadata: {
      assignedBy: 'Ana Silva'
    }
  },
  {
    id: '4',
    type: 'overdue_task',
    title: 'Tarefa em atraso',
    message: 'A tarefa "Revisão de código" está 3 dias em atraso',
    userId: 'user1',
    projectId: '1',
    taskId: '4',
    isRead: false,
    priority: 'urgent',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    actionUrl: '/apk/project/Website%20Redesign/tasks/manage?taskId=4',
    metadata: {
      daysUntilDue: -3
    }
  },
  {
    id: '5',
    type: 'project_assignment',
    title: 'Adicionado ao projeto',
    message: 'Você foi adicionado ao projeto "Mobile App Development"',
    userId: 'user1',
    projectId: '2',
    isRead: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
    actionUrl: '/apk/project/Mobile%20App%20Development',
    metadata: {
      assignedBy: 'João Costa'
    }
  }
];

const defaultSettings: NotificationSettings = {
  userId: 'user1',
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  taskDeadlines: {
    enabled: true,
    daysBefore: 2
  },
  taskStatusChanges: {
    enabled: true,
    onlyMyTasks: false
  },
  taskAssignments: {
    enabled: true
  },
  projectAssignments: {
    enabled: true
  },
  overdueReminders: {
    enabled: true,
    frequency: 'daily'
  }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [filter, setFilter] = useState<NotificationFilter>('all');
 
  const [isLoading,] = useState(false);

  // Filtrar notificações baseado no filtro atual
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'urgent':
        return notification.priority === 'urgent';
      case 'task_related':
        return ['task_deadline', 'task_status_change', 'task_assignment', 'overdue_task'].includes(notification.type);
      case 'project_related':
        return ['project_assignment', 'project_update'].includes(notification.type);
      default:
        return true;
    }
  });

  // Estatísticas das notificações
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
    overdue: notifications.filter(n => n.type === 'overdue_task').length
  };

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Deletar todas as notificações lidas
  const deleteReadNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.isRead));
  }, []);

  // Criar nova notificação (simula criação automática)
  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!settings.inAppNotifications) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, [settings.inAppNotifications]);

  // Simular notificação de mudança de status de tarefa
  const notifyTaskStatusChange = useCallback((task: Task, oldStatus: string, newStatus: string, projectTitle: string) => {
    if (!settings.taskStatusChanges.enabled) return;

    const priority = newStatus === 'completed' ? 'low' : 'medium';

    createNotification({
      type: 'task_status_change',
      title: 'Status da tarefa alterado',
      message: `A tarefa "${task.title}" foi alterada de ${getStatusLabel(oldStatus)} para ${getStatusLabel(newStatus)}`,
      userId: settings.userId,
      projectId: task.id, // Seria o projectId real
      taskId: task.id,
      isRead: false,
      priority,
      actionUrl: `/apk/project/${encodeURIComponent(projectTitle)}/tasks`,
      metadata: {
        oldStatus,
        newStatus
      }
    });
  }, [settings.taskStatusChanges.enabled, settings.userId, createNotification]);

  // Simular notificação de atribuição de tarefa
  const notifyTaskAssignment = useCallback((task: Task, assignedBy: string, projectTitle: string) => {
    if (!settings.taskAssignments.enabled) return;

    createNotification({
      type: 'task_assignment',
      title: 'Nova tarefa atribuída',
      message: `Você foi atribuído à tarefa "${task.title}" por ${assignedBy}`,
      userId: settings.userId,
      projectId: task.id, // Seria o projectId real
      taskId: task.id,
      isRead: false,
      priority: task.priority === 'high' ? 'high' : 'medium',
      actionUrl: `/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage?taskId=${task.id}`,
      metadata: {
        assignedBy
      }
    });
  }, [settings.taskAssignments.enabled, settings.userId, createNotification]);

  // Simular notificação de prazo se aproximando
  const notifyTaskDeadline = useCallback((task: Task, daysUntilDue: number, projectTitle: string) => {
    if (!settings.taskDeadlines.enabled || daysUntilDue > settings.taskDeadlines.daysBefore) return;

    const priority = daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium';

    createNotification({
      type: 'task_deadline',
      title: 'Prazo se aproximando',
      message: `A tarefa "${task.title}" vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}`,
      userId: settings.userId,
      projectId: task.id, // Seria o projectId real
      taskId: task.id,
      isRead: false,
      priority,
      dueDate: task.dueDate,
      actionUrl: `/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage?taskId=${task.id}`,
      metadata: {
        daysUntilDue
      }
    });
  }, [settings.taskDeadlines.enabled, settings.taskDeadlines.daysBefore, settings.userId, createNotification]);

  // Simular notificação de tarefa vencida
  const notifyOverdueTask = useCallback((task: Task, daysOverdue: number, projectTitle: string) => {
    if (!settings.overdueReminders.enabled) return;

    createNotification({
      type: 'overdue_task',
      title: 'Tarefa em atraso',
      message: `A tarefa "${task.title}" está ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'} em atraso`,
      userId: settings.userId,
      projectId: task.id, // Seria o projectId real
      taskId: task.id,
      isRead: false,
      priority: 'urgent',
      actionUrl: `/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage?taskId=${task.id}`,
      metadata: {
        daysUntilDue: -daysOverdue
      }
    });
  }, [settings.overdueReminders.enabled, settings.userId, createNotification]);

  // Simular notificação de atribuição ao projeto
  const notifyProjectAssignment = useCallback((project: Project, assignedBy: string) => {
    if (!settings.projectAssignments.enabled) return;

    createNotification({
      type: 'project_assignment',
      title: 'Adicionado ao projeto',
      message: `Você foi adicionado ao projeto "${project.title}" por ${assignedBy}`,
      userId: settings.userId,
      projectId: project.id,
      isRead: false,
      priority: 'medium',
      actionUrl: `/apk/project/${encodeURIComponent(project.title)}`,
      metadata: {
        assignedBy
      }
    });
  }, [settings.projectAssignments.enabled, settings.userId, createNotification]);

  // Verificar prazos automaticamente (simula um job em background)
  useEffect(() => {
    if (!settings.taskDeadlines.enabled) return;

    const checkDeadlines = () => {
      // Aqui você faria uma verificação real com as tarefas do usuário
      // Por agora, vamos simular que encontramos uma tarefa próxima do prazo
      console.log('Verificando prazos de tarefas...');
    };

    const interval = setInterval(checkDeadlines, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, [settings.taskDeadlines.enabled]);

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    settings,
    filter,
    stats,
    isLoading,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    updateSettings,
    // Funções para criar notificações
    notifyTaskStatusChange,
    notifyTaskAssignment,
    notifyTaskDeadline,
    notifyOverdueTask,
    notifyProjectAssignment
  };
}

// Função auxiliar para obter label do status
function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'active': return 'Em Progresso';
    case 'completed': return 'Concluída';
    default: return status;
  }
}
