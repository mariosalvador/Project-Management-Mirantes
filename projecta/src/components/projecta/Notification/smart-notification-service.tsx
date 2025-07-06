"use client"

import { useEffect, useCallback, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Task, Project } from '@/types/project';

interface SmartNotificationServiceProps {
  projects: Project[];
}

export function SmartNotificationService({ projects }: SmartNotificationServiceProps) {
  const {
    notifyTaskDeadline,
    notifyOverdueTask,
    settings
  } = useNotifications();

  const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set());

  const generateNotificationKey = (type: string, taskId: string, additionalInfo?: string) => {
    const today = new Date().toDateString();
    return `${type}-${taskId}-${today}-${additionalInfo || ''}`;
  };

  const checkTaskDeadlines = useCallback(() => {
    if (!settings.taskDeadlines.enabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    projects.forEach((project: Project) => {
      if (!project.tasks) return;

      project.tasks.forEach((task: Task) => {
        if (task.status === 'completed') return;

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Verificar se a tarefa está vencida
        if (diffDays < 0) {
          const daysOverdue = Math.abs(diffDays);
          const notificationKey = generateNotificationKey('overdue', task.id, daysOverdue.toString());

          if (!sentNotifications.has(notificationKey)) {
            // Notificar apenas nos dias 1, 3, 7, 14, 30
            if ([1, 3, 7, 14, 30].includes(daysOverdue)) {
              notifyOverdueTask(task, daysOverdue, project.title);
              setSentNotifications(prev => new Set(prev).add(notificationKey));
            }
          }
        }
        // Verificar se o prazo está se aproximando
        else if (diffDays <= settings.taskDeadlines.daysBefore && diffDays >= 0) {
          const notificationKey = generateNotificationKey('deadline', task.id, diffDays.toString());

          if (!sentNotifications.has(notificationKey)) {
            notifyTaskDeadline(task, diffDays, project.title);
            setSentNotifications(prev => new Set(prev).add(notificationKey));
          }
        }
      });
    });
  }, [projects, settings, sentNotifications, notifyTaskDeadline, notifyOverdueTask]);

  const checkProjectUpdates = useCallback(() => {
    projects.forEach((project: Project) => {
      if (!project.tasks) return;

      const taskStats = {
        total: project.tasks.length,
        completed: project.tasks.filter(t => t.status === 'completed').length,
        active: project.tasks.filter(t => t.status === 'active').length,
        overdue: project.tasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate < new Date() && t.status !== 'completed';
        }).length
      };

      // Notificar sobre marcos importantes do projeto
      const completionRate = (taskStats.completed / taskStats.total) * 100;

      // Notificar quando o projeto atinge 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (completionRate >= milestone) {
          const notificationKey = generateNotificationKey('milestone', project.id, milestone.toString());

          if (!sentNotifications.has(notificationKey)) {
            setSentNotifications(prev => new Set(prev).add(notificationKey));
          }
        }
      });
    });
  }, [projects, sentNotifications]);

  const checkQuietHours = () => {
    return false;
  };

  useEffect(() => {
    if (checkQuietHours()) return;

    checkTaskDeadlines();
    checkProjectUpdates();

    // Verificar a cada hora
    const interval = setInterval(() => {
      if (!checkQuietHours()) {
        checkTaskDeadlines();
        checkProjectUpdates();
      }
    }, 3600000); 

    // Limpar notificações antigas (mais de 24 horas)
    const cleanupInterval = setInterval(() => {
      setSentNotifications(new Set());
    }, 24 * 60 * 60 * 1000); 

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [checkTaskDeadlines, checkProjectUpdates]);

  return null;
}
