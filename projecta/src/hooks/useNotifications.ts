import { useState, useEffect, useCallback } from 'react';
import { NotificationFilterOptions, NotificationStats } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
  NotificationData
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

  // Buscar contador de não lidas
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

  // Polling para atualizações (opcional)
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
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount
  };
};