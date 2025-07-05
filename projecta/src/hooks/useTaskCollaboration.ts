"use client"

import { useState, useCallback } from 'react';
import { Task } from '@/types/project';
import { TaskWithCollaboration, Activity, Comment } from '@/types/collaboration';
import { usePermissions } from './usePermissions';
import { useActivityLogger } from './useActivityLogger';
import { useNotifications } from './useNotifications';

interface UseTaskCollaborationProps {
  projectId: string;
  taskId: string;
}

export function useTaskCollaboration({ projectId, taskId }: UseTaskCollaborationProps) {
  const { hasPermission, currentUser, users } = usePermissions();
  const { logTaskAssigned, logTaskUpdated, logTaskStatusChanged } = useActivityLogger();
  const { addNotificationForUser } = useNotifications();

  // Estado das tarefas (em uma aplicação real, isso viria de um contexto ou API)
  const [tasks, setTasks] = useState<TaskWithCollaboration[]>([]);
  const [loading, setLoading] = useState(false);

  // Encontrar a tarefa atual
  const currentTask = tasks.find(task => task.id === taskId);

  // Verificações de permissões
  const canEdit = hasPermission('task', 'update');
  const canAssign = hasPermission('task', 'assign');
  const canComment = hasPermission('task', 'comment');
  const canDelete = hasPermission('task', 'delete');

  // Atribuir usuário à tarefa
  const assignUser = useCallback(async (userId: string) => {
    if (!canAssign || !currentTask || !currentUser) return false;

    try {
      setLoading(true);

      // Verificar se o usuário já está atribuído
      if (currentTask.assignees.includes(userId)) {
        return false;
      }

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        assignees: [...currentTask.assignees, userId]
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Registrar atividade
      const assignedUser = users.find(u => u.id === userId);
      if (assignedUser) {
        logTaskAssigned({
          taskId,
          taskTitle: currentTask.title,
          projectId,
          projectTitle: 'Projeto' // Em uma app real, isso viria dos dados do projeto
        }, assignedUser.name);

        // Notificar o usuário atribuído
        addNotificationForUser(userId, {
          type: 'task_assignment',
          title: 'Tarefa Atribuída',
          message: `Você foi atribuído à tarefa "${currentTask.title}"`,
          projectId,
          taskId,
          priority: 'medium'
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao atribuir usuário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canAssign, currentTask, currentUser, taskId, users, logTaskAssigned, addNotificationForUser, projectId]);

  // Desatribuir usuário da tarefa
  const unassignUser = useCallback(async (userId: string) => {
    if (!canAssign || !currentTask) return false;

    try {
      setLoading(true);

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        assignees: currentTask.assignees.filter(id => id !== userId)
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Registrar atividade
      const unassignedUser = users.find(u => u.id === userId);
      if (unassignedUser) {
        logTaskUpdated({
          taskId,
          taskTitle: currentTask.title,
          projectId,
          projectTitle: 'Projeto'
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao desatribuir usuário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canAssign, currentTask, taskId, users, logTaskUpdated, projectId]);

  // Atualizar status da tarefa
  const updateTaskStatus = useCallback(async (newStatus: Task['status']) => {
    if (!canEdit || !currentTask) return false;

    try {
      setLoading(true);

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        status: newStatus
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Registrar atividade
      logTaskStatusChanged({
        taskId,
        taskTitle: currentTask.title,
        projectId,
        projectTitle: 'Projeto'
      }, currentTask.status, newStatus);

      // Notificar usuários atribuídos sobre mudança de status
      currentTask.assignees.forEach(assigneeId => {
        if (assigneeId !== currentUser?.id) {
          addNotificationForUser(assigneeId, {
            type: 'task_status_change',
            title: 'Status da Tarefa Atualizado',
            message: `O status da tarefa "${currentTask.title}" foi alterado para ${newStatus === 'completed' ? 'Concluída' :
                newStatus === 'active' ? 'Em Andamento' : 'Pendente'
              }`,
            projectId,
            taskId,
            priority: 'medium'
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, currentTask, taskId, logTaskStatusChanged, projectId, addNotificationForUser, currentUser]);

  // Atualizar observadores da tarefa
  const updateWatchers = useCallback(async (watcherIds: string[]) => {
    if (!currentTask) return false;

    try {
      setLoading(true);

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        watchers: watcherIds
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar observadores:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentTask, taskId]);

  // Adicionar comentário à tarefa
  const addTaskComment = useCallback(async (content: string, mentions: string[] = []) => {
    if (!canComment || !currentTask || !currentUser) return false;

    try {
      setLoading(true);

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        mentions
      };

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        comments: [...(currentTask.comments || []), newComment]
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Notificar usuários mencionados
      mentions.forEach(mentionedUserId => {
        const mentionedUser = users.find(u => u.id === mentionedUserId);
        if (mentionedUser) {
          addNotificationForUser(mentionedUserId, {
            type: 'mention',
            title: 'Você foi mencionado',
            message: `${currentUser.name} mencionou você em um comentário da tarefa "${currentTask.title}"`,
            projectId,
            taskId,
            priority: 'high'
          });
        }
      });

      // Notificar observadores sobre novo comentário
      (currentTask.watchers || []).forEach(watcherId => {
        if (watcherId !== currentUser.id && !mentions.includes(watcherId)) {
          addNotificationForUser(watcherId, {
            type: 'comment',
            title: 'Novo Comentário',
            message: `${currentUser.name} comentou na tarefa "${currentTask.title}"`,
            projectId,
            taskId,
            priority: 'low'
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canComment, currentTask, currentUser, taskId, users, addNotificationForUser, projectId]);

  // Adicionar atualização à tarefa
  const addTaskUpdate = useCallback(async (updateContent: string) => {
    if (!canEdit || !currentTask || !currentUser) return false;

    try {
      setLoading(true);

      // Criar nova atividade para a atualização
      const updateActivity: Activity = {
        id: `activity-${Date.now()}`,
        type: 'task_updated',
        description: `${currentUser.name} adicionou uma atualização: "${updateContent}"`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        targetType: 'task',
        targetId: taskId,
        targetName: currentTask.title,
        createdAt: new Date().toISOString(),
        metadata: { update: updateContent }
      };

      const updatedTask: TaskWithCollaboration = {
        ...currentTask,
        activities: [...(currentTask.activities || []), updateActivity]
      };

      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Notificar usuários atribuídos sobre a atualização
      currentTask.assignees.forEach(assigneeId => {
        if (assigneeId !== currentUser.id) {
          addNotificationForUser(assigneeId, {
            type: 'task_update',
            title: 'Atualização da Tarefa',
            message: `${currentUser.name} adicionou uma atualização à tarefa "${currentTask.title}"`,
            projectId,
            taskId,
            priority: 'medium'
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao adicionar atualização:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, currentTask, currentUser, taskId, addNotificationForUser, projectId]);

  // Obter usuários disponíveis para atribuição
  const getAvailableUsers = useCallback(() => {
    if (!currentTask) return [];
    return users.filter(user =>
      !currentTask.assignees.includes(user.id) &&
      !currentTask.assignees.includes(user.name)
    );
  }, [currentTask, users]);

  // Obter usuários atribuídos
  const getAssignedUsers = useCallback(() => {
    if (!currentTask) return [];
    return users.filter(user =>
      currentTask.assignees.includes(user.id) ||
      currentTask.assignees.includes(user.name)
    );
  }, [currentTask, users]);

  // Verificar se o usuário atual está seguindo a tarefa
  const isWatching = currentTask?.watchers?.includes(currentUser?.id || '') || false;

  return {
    // Estado
    task: currentTask,
    loading,
    isWatching,

    // Permissões
    canEdit,
    canAssign,
    canComment,
    canDelete,

    // Dados computados
    assignedUsers: getAssignedUsers(),
    availableUsers: getAvailableUsers(),
    totalComments: currentTask?.comments?.length || 0,
    recentActivities: currentTask?.activities?.slice(0, 5) || [],

    // Ações
    assignUser,
    unassignUser,
    updateTaskStatus,
    updateWatchers,
    addTaskComment,
    addTaskUpdate
  };
}

export default useTaskCollaboration;
