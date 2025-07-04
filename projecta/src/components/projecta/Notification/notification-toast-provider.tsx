"use client"

import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/toast';
import { Notification } from '@/types/notification';

interface NotificationToastProviderProps {
  children: React.ReactNode;
}

export function NotificationToastProvider({ children }: NotificationToastProviderProps) {
  const { notifications } = useNotifications();
  const { showToast } = useToast();

  // Rastrear as notificações já processadas
  const [processedNotifications, setProcessedNotifications] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    // Verificar novas notificações não lidas
    const newNotifications = notifications.filter(notification =>
      !notification.isRead &&
      !processedNotifications.has(notification.id) &&
      // Apenas notificações criadas nos últimos 5 minutos para evitar spam
      new Date().getTime() - new Date(notification.createdAt).getTime() < 5 * 60 * 1000
    );

    newNotifications.forEach(notification => {
      // Mostrar toast para a nova notificação
      showToast(
        `${notification.title}: ${notification.message}`,
        getToastType(notification.priority)
      );

      // Marcar como processada
      setProcessedNotifications(prev => new Set(prev).add(notification.id));
    });
  }, [notifications, processedNotifications, showToast]);

  const getToastType = (priority: Notification['priority']): 'success' | 'error' | 'warning' | 'info' => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  return <>{children}</>;
}
