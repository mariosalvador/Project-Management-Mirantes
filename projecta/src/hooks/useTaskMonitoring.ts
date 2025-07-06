import { useEffect } from 'react';
import { Task, Project } from '@/types/project';
import { useNotifications } from './useNotifications';

export function useTaskDeadlineMonitor(tasks: Task[], project: Project | undefined) {
  // TODO: Implementar funções de notificação no useNotifications
  // const { notifyTaskDeadline, notifyOverdueTask } = useNotifications();

  useEffect(() => {
    if (!tasks || !project) return;

    const checkTaskDeadlines = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tasks.forEach(task => {
        if (task.status === 'completed') return;

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Verificar se a tarefa está vencida
        if (diffDays < 0) {
          const daysOverdue = Math.abs(diffDays);
          console.log(`Tarefa vencida: ${task.title} - ${daysOverdue} dias`);
          // notifyOverdueTask(task, daysOverdue, project.title);
        }
        // Verificar se o prazo está se aproximando
        else if (diffDays <= 3 && diffDays >= 0) {
          console.log(`Prazo se aproximando: ${task.title} - ${diffDays} dias`);
          // notifyTaskDeadline(task, diffDays, project.title);
        }
      });
    };

    // Verificar imediatamente
    checkTaskDeadlines();

    // Verificar novamente a cada hora
    const interval = setInterval(checkTaskDeadlines, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, [tasks, project]);
}

// Hook para monitorar mudanças em tempo real
export function useRealTimeNotifications() {
  // TODO: Implementar funções de notificação no useNotifications
  // const {
  //   notifyTaskAssignment,
  //   notifyProjectAssignment,
  //   notifyTaskStatusChange
  // } = useNotifications();

  // Simular recebimento de notificações em tempo real (WebSocket)
  useEffect(() => {
    // Aqui você conectaria com um WebSocket real
    const mockWebSocket = () => {
      console.log('🔔 Sistema de notificações em tempo real ativo');

      // Simular algumas notificações após um tempo
      setTimeout(() => {
        // Exemplo: nova tarefa atribuída
        console.log('📨 Nova notificação simulada: Tarefa atribuída');
      }, 30000); // 30 segundos
    };

    mockWebSocket();
  }, []);

  return {
    // TODO: Retornar funções reais quando implementadas
    // notifyTaskAssignment,
    // notifyProjectAssignment,
    // notifyTaskStatusChange
  };
}

// Hook para estatísticas de notificações
export function useNotificationStats() {
  const { stats } = useNotifications();

  return {
    ...stats,
    hasUrgentNotifications: stats.urgent > 0,
    hasOverdueNotifications: stats.byType.overdue_task > 0,
    needsAttention: stats.urgent > 0 || stats.byType.overdue_task > 0
  };
}
