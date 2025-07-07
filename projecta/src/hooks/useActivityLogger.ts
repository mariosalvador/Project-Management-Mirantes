"use client"

import { useCallback } from 'react';
import { useActivity } from './useActivity';

interface TaskActivity {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectTitle: string;
}

interface ProjectActivity {
  projectId: string;
  projectTitle: string;
}

interface UserActivity {
  userId: string;
  userName: string;
  projectId?: string;
  projectTitle?: string;
}

export function useActivityLogger() {
  const { addActivity } = useActivity();

  // Atividades de tarefas
  const logTaskCreated = useCallback((task: TaskActivity) => {
    addActivity('task_created', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logTaskStatusChanged = useCallback((task: TaskActivity, oldStatus: string, newStatus: string) => {
    addActivity('task_status_changed', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle,
      oldValue: oldStatus,
      newValue: newStatus
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logTaskAssigned = useCallback((task: TaskActivity, assignedTo: string) => {
    addActivity('task_assigned', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle,
      assignedTo
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logTaskUnassigned = useCallback((task: TaskActivity, unassignedFrom: string) => {
    addActivity('task_unassigned', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle,
      unassignedFrom
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logTaskUpdated = useCallback((task: TaskActivity) => {
    addActivity('task_updated', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  // Atividades de projetos
  const logProjectCreated = useCallback((project: ProjectActivity, taskCount: number = 0) => {
    addActivity('project_created', {
      projectTitle: project.projectTitle,
      taskCount
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  const logProjectStatusChanged = useCallback((project: ProjectActivity, oldStatus: string, newStatus: string) => {
    addActivity('project_status_changed', {
      projectTitle: project.projectTitle,
      oldValue: oldStatus,
      newValue: newStatus
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  const logProjectUpdated = useCallback((project: ProjectActivity, changedFields?: string) => {
    addActivity('project_updated', {
      projectTitle: project.projectTitle,
      changedFields
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  // Atividades de comentários
  const logCommentAdded = useCallback((task: TaskActivity) => {
    addActivity('comment_added', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logCommentUpdated = useCallback((task: TaskActivity) => {
    addActivity('comment_updated', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  const logCommentDeleted = useCallback((task: TaskActivity) => {
    addActivity('comment_deleted', {
      taskTitle: task.taskTitle,
      projectTitle: task.projectTitle
    }, {
      projectId: task.projectId,
      taskId: task.taskId
    });
  }, [addActivity]);

  // Atividades de usuários
  const logUserAdded = useCallback((user: UserActivity) => {
    addActivity('user_added', {
      userName: user.userName,
      projectTitle: user.projectTitle,
      userRole: 'member'
    }, {
      projectId: user.projectId,
      targetUserId: user.userId
    });
  }, [addActivity]);

  const logUserRemoved = useCallback((user: UserActivity) => {
    addActivity('user_removed', {
      userName: user.userName,
      projectTitle: user.projectTitle
    }, {
      projectId: user.projectId,
      targetUserId: user.userId
    });
  }, [addActivity]);

  const logUserRoleChanged = useCallback((user: UserActivity, newRole: string) => {
    addActivity('user_role_changed', {
      userName: user.userName,
      projectTitle: user.projectTitle,
      newValue: newRole
    }, {
      projectId: user.projectId,
      targetUserId: user.userId
    });
  }, [addActivity]);

  // Atividades de marcos
  const logMilestoneCompleted = useCallback((project: ProjectActivity, milestoneName: string) => {
    addActivity('milestone_completed', {
      projectTitle: project.projectTitle,
      milestoneName
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  // Atividades de arquivos
  const logFileUploaded = useCallback((project: ProjectActivity, fileName: string) => {
    addActivity('file_uploaded', {
      projectTitle: project.projectTitle,
      fileName
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  const logFileDeleted = useCallback((project: ProjectActivity, fileName: string) => {
    addActivity('file_deleted', {
      projectTitle: project.projectTitle,
      fileName
    }, {
      projectId: project.projectId
    });
  }, [addActivity]);

  return {
    // Tarefas
    logTaskCreated,
    logTaskStatusChanged,
    logTaskAssigned,
    logTaskUnassigned,
    logTaskUpdated,

    // Projetos
    logProjectCreated,
    logProjectStatusChanged,
    logProjectUpdated,

    // Comentários
    logCommentAdded,
    logCommentUpdated,
    logCommentDeleted,

    // Usuários
    logUserAdded,
    logUserRemoved,
    logUserRoleChanged,

    // Marcos
    logMilestoneCompleted,

    // Arquivos
    logFileUploaded,
    logFileDeleted
  };
}
