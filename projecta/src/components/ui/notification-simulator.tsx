"use client"

import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { mockProjects } from '@/app/apk/(pro-jecta)/project/mock';
import { Task, Project } from '@/types/project';

// Simulador de notificações em tempo real
export function NotificationSimulator() {
  const {
    notifyTaskDeadline,
    notifyOverdueTask,
    notifyTaskAssignment,
    notifyProjectAssignment
  } = useNotifications();

  useEffect(() => {
    // Simular verificação de prazos a cada 30 segundos
    const checkDeadlines = () => {
      const today = new Date();

      mockProjects.forEach((project: Project) => {
        if (project.tasks) {
          project.tasks.forEach((task: Task) => {
            if (task.status === 'completed') return;

            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Verificar se a tarefa está vencida
            if (diffDays < 0) {
              const daysOverdue = Math.abs(diffDays);
              // Notificar apenas uma vez por dia para tarefas vencidas
              if (daysOverdue === 1 || daysOverdue % 7 === 0) {
                notifyOverdueTask(task, daysOverdue, project.title);
              }
            }
            // Verificar se o prazo está se aproximando (1, 2, 3 dias)
            else if (diffDays <= 3 && diffDays >= 0) {
              notifyTaskDeadline(task, diffDays, project.title);
            }
          });
        }
      });
    };

    // Executar imediatamente e depois a cada 30 segundos
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 30000);

    // Simular notificações de atribuição após 5 segundos
    const simulateAssignments = setTimeout(() => {
      // Encontrar tarefas não atribuídas ou com poucas atribuições
      mockProjects.forEach((project: Project) => {
        if (project.tasks) {
          const unassignedTasks = project.tasks.filter(
            (task: Task) => task.assignees.length === 0
          );

          if (unassignedTasks.length > 0) {
            const randomTask = unassignedTasks[Math.floor(Math.random() * unassignedTasks.length)];
            notifyTaskAssignment(randomTask, 'João Silva', project.title);
          }
        }
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(simulateAssignments);
    };
  }, [notifyTaskDeadline, notifyOverdueTask, notifyTaskAssignment, notifyProjectAssignment]);

  return null; // Componente invisível
}

// Hook para integração com as páginas
export function useAutomaticNotifications() {
  useEffect(() => {
    // Este hook pode ser usado em páginas específicas para ativar notificações automáticas
    console.log('Sistema de notificações automáticas ativado');
  }, []);
}
