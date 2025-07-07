import { useState, useEffect, useCallback } from 'react';
import { NotificationFilterOptions, NotificationStats, NotificationSettings } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/project';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
  NotificationData,
  createNotification
} from '@/Api/services/notifications';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<NotificationFilterOptions>({
    types: [],
    priority: null,
    isRead: null,
    dateRange: null
  });

  // Configurações de notificação padrão
  const [settings, setSettings] = useState<NotificationSettings>({
    userId: user?.uid || '',
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
  });

  // Buscar todas as notificações
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const fetchedNotifications = await getUserNotifications(user.uid);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Função para atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Funções de notificação
  const notifyTaskDeadline = useCallback(async (task: Task, daysUntil: number, projectTitle: string) => {
    if (!user?.uid || !settings.taskDeadlines.enabled) return;

    try {
      await createNotification({
        type: 'task_deadline',
        title: `Prazo se aproximando: ${task.title}`,
        message: `O prazo da tarefa "${task.title}" no projeto "${projectTitle}" vence em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`,
        userId: user.uid,
        projectId: task.assignees?.[0] || '',
        taskId: task.id,
        isRead: false,
        priority: daysUntil <= 1 ? 'urgent' : 'high',
        metadata: {
          daysUntilDue: daysUntil,
          projectTitle
        }
      });

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao criar notificação de prazo:', error);
    }
  }, [user?.uid, settings.taskDeadlines.enabled, fetchNotifications]);

  const notifyOverdueTask = useCallback(async (task: Task, daysOverdue: number, projectTitle: string) => {
    if (!user?.uid || !settings.overdueReminders.enabled) return;

    try {
      await createNotification({
        type: 'overdue_task',
        title: `Tarefa vencida: ${task.title}`,
        message: `A tarefa "${task.title}" no projeto "${projectTitle}" está vencida há ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`,
        userId: user.uid,
        projectId: task.assignees?.[0] || '',
        taskId: task.id,
        isRead: false,
        priority: 'urgent',
        metadata: {
          daysUntilDue: -daysOverdue,
          projectTitle
        }
      });

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao criar notificação de vencimento:', error);
    }
  }, [user?.uid, settings.overdueReminders.enabled, fetchNotifications]);
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao buscar contador de não lidas:', error);
    }
  }, [user?.uid]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const success = await markAllNotificationsAsRead(user.uid);
      if (success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [user?.uid]);

  // Deletar notificação
  const deleteNotif = useCallback(async (notificationId: string) => {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        // Atualizar contador se a notificação não estava lida
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [notifications]);

  // Aplicar filtros
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por tipo
    if (filter.types && filter.types.length > 0 && !filter.types.includes(notification.type)) {
      return false;
    }

    // Filtro por prioridade
    if (filter.priority && notification.priority !== filter.priority) {
      return false;
    }

    // Filtro por status de leitura
    if (filter.isRead !== null && notification.isRead !== filter.isRead) {
      return false;
    }

    // Filtro por data
    if (filter.dateRange) {
      const notificationDate = new Date(notification.createdAt);
      const now = new Date();

      switch (filter.dateRange) {
        case 'today':
          return notificationDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return notificationDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return notificationDate >= monthAgo;
        default:
          return true;
      }
    }

    return true;
  });

  // Estatísticas
  const stats: NotificationStats = {
    total: notifications.length,
    unread: unreadCount,
    high: notifications.filter(n => n.priority === 'high').length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
    byType: {
      task_deadline: notifications.filter(n => n.type === 'task_deadline').length,
      task_assignment: notifications.filter(n => n.type === 'task_assignment').length,
      task_status_change: notifications.filter(n => n.type === 'task_status_change').length,
      project_assignment: notifications.filter(n => n.type === 'project_assignment').length,
      project_update: notifications.filter(n => n.type === 'project_update').length,
      overdue_task: notifications.filter(n => n.type === 'overdue_task').length,
      team_invitation: notifications.filter(n => n.type === 'team_invitation').length,
      invite_accepted: notifications.filter(n => n.type === 'invite_accepted').length
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.uid, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [user?.uid, fetchUnreadCount]);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    unreadCount,
    isLoading,
    filter,
    stats,
    settings,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
    updateSettings,
    notifyTaskDeadline,
    notifyOverdueTask
  };
};