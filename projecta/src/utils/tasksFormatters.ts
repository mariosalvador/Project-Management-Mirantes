import { Task } from "@/types/project";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "planning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "on-hold":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Ativo";
    case "completed":
      return "Concluído";
    case "planning":
      return "Planejamento";
    case "on-hold":
      return "Pausado";
    default:
      return status;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "high":
      return "Alta";
    case "medium":
      return "Média";
    case "low":
      return "Baixa";
    default:
      return priority;
  }
};

export const getTaskStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getTaskStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Concluída";
    case "active":
      return "Em Progresso";
    case "pending":
      return "Pendente";
    default:
      return status;
  }
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.status === 'completed') return 100;
  if (task.status === 'pending') return 0;

  // Para tarefas ativas, calcular baseado nas horas
  if (task.estimatedHours && task.actualHours) {
    return Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100));
  }

  return 50; // Default para tarefas ativas sem horas definidas
};

export const formatHours = (hours?: number): string => {
  if (!hours) return '-';
  return `${hours}h`;
};

export const formatAssignees = (assignees: string[]): string => {
  if (assignees.length === 0) return 'Não atribuído';
  if (assignees.length === 1) return assignees[0];
  if (assignees.length === 2) return `${assignees[0]} e ${assignees[1]}`;
  return `${assignees[0]} e mais ${assignees.length - 1}`;
};

export const getTasksStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const active = tasks.filter(t => t.status === 'active').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActual = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  return {
    total,
    completed,
    active,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalEstimated,
    totalActual,
    hoursProgress: totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0
  };
};

export const canStartTask = (task: Task, allTasks: Task[]): boolean => {
  if (!task.dependencies || task.dependencies.length === 0) return true;

  return task.dependencies.every(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask?.status === 'completed';
  });
};

export const getBlockedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task =>
    task.status === 'pending' && !canStartTask(task, tasks)
  );
};

export const getOverdueTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  });
};