"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from './useProjects';
import { usePermissions } from './usePermissions';
import { Project, Task } from '@/types/project';
import {
  getUserCollaborationStats,
  getProjectMembers,
  getCollaborationData,
  createCollaborationContext,
  addActivity
} from '@/Api/services/collaboration';
import { updateProject } from '@/Api/services/projects';
import { toast } from 'sonner';

interface CollaborationStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  myProgress: number;
  totalComments: number;
  totalActivities: number;
}

interface ProjectMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  projectId: string;
  joinedAt: string;
  isActive: boolean;
  lastActivity?: string;
}

interface UserProjectData extends Project {
  userRole?: string;
  members: ProjectMember[];
}

interface UseCollaborationDataReturn {
  userProjects: UserProjectData[];
  stats: CollaborationStats;
  loading: boolean;
  error: string | null;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => Promise<void>;
  refreshData: () => Promise<void>;
  getTasksForUser: (userId: string) => Task[];
  getProjectsUserCanEdit: () => UserProjectData[];
}

export const useCollaborationData = (): UseCollaborationDataReturn => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, loadProjects } = useProjects();
  const { hasPermission } = usePermissions();

  const [userProjects, setUserProjects] = useState<UserProjectData[]>([]);
  const [stats, setStats] = useState<CollaborationStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    myProgress: 0,
    totalComments: 0,
    totalActivities: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados de membros para cada projeto do Firebase
  const loadProjectsWithMembers = useCallback(async () => {
    if (!user?.uid || !projects.length) {
      setUserProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectsWithMembers: UserProjectData[] = [];

      for (const project of projects) {
        try {
          // Buscar membros do projeto do Firebase
          const members = await getProjectMembers(project.id);

          // Encontrar a role do usuário atual no projeto
          const userMember = members.find(member => member.userId === user.uid);
          const userRole = userMember?.role || 'viewer';

          // Verificar se existe contexto de colaboração, se não criar um
          const collaborationData = await getCollaborationData(project.id, 'project');

          if (!collaborationData) {
            // Criar contexto de colaboração se não existir
            const memberIds = members.map(m => m.userId);
            await createCollaborationContext(
              project.id,
              'project',
              project.title,
              memberIds,
              user.uid
            );
          }

          projectsWithMembers.push({
            ...project,
            userRole,
            members
          });
        } catch (projectError) {
          console.error(`Erro ao carregar dados do projeto ${project.id}:`, projectError);
          // Adicionar projeto sem dados de membros em caso de erro
          projectsWithMembers.push({
            ...project,
            userRole: 'viewer',
            members: []
          });
        }
      }

      setUserProjects(projectsWithMembers);
    } catch (err) {
      console.error('Erro ao carregar projetos com membros:', err);
      setError('Erro ao carregar dados de colaboração');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, projects]);

  // Calcular estatísticas localmente como fallback
  const calculateLocalStats = useCallback(() => {
    if (!user?.uid || !userProjects.length) {
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        myProgress: 0,
        totalComments: 0,
        totalActivities: 0
      });
      return;
    }

    const now = new Date();
    let totalTasks = 0;
    let activeTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;
    let userTasks = 0;
    let userCompletedTasks = 0;

    const activeProjects = userProjects.filter(p => p.status === 'active').length;
    const completedProjects = userProjects.filter(p => p.status === 'completed').length;

    userProjects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          totalTasks++;

          // Verificar se o usuário está atribuído à tarefa
          const isUserAssigned = task.assignees.includes(user.uid);
          if (isUserAssigned) {
            userTasks++;
            if (task.status === 'completed') {
              userCompletedTasks++;
            }
          }

          // Contar tarefas por status
          switch (task.status) {
            case 'active':
              activeTasks++;
              break;
            case 'completed':
              completedTasks++;
              break;
            case 'pending':
              pendingTasks++;
              break;
          }

          // Verificar tarefas atrasadas
          if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
            overdueTasks++;
          }
        });
      }
    });

    const myProgress = userTasks > 0 ? Math.round((userCompletedTasks / userTasks) * 100) : 0;

    setStats({
      totalProjects: userProjects.length,
      activeProjects,
      completedProjects,
      totalTasks,
      activeTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      myProgress,
      totalComments: 0,
      totalActivities: 0
    });
  }, [user?.uid, userProjects]);

  // Carregar estatísticas do Firebase
  const loadStatsFromFirebase = useCallback(async () => {
    if (!user?.uid) {
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        myProgress: 0,
        totalComments: 0,
        totalActivities: 0
      });
      return;
    }

    try {
      const firebaseStats = await getUserCollaborationStats(user.uid);
      setStats(firebaseStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do Firebase:', error);
      // Fallback para cálculo local se houver erro
      calculateLocalStats();
    }
  }, [user?.uid, calculateLocalStats]);

  // Atualizar status de tarefa com registro de atividade
  const updateTaskStatus = useCallback(async (projectId: string, taskId: string, newStatus: Task['status']) => {
    if (!user?.uid) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const project = userProjects.find(p => p.id === projectId);
      if (!project) {
        toast.error('Projeto não encontrado');
        return;
      }

      const task = project.tasks?.find(t => t.id === taskId);
      if (!task) {
        toast.error('Tarefa não encontrada');
        return;
      }

      // Verificar se o usuário pode editar esta tarefa
      const canEdit = task.assignees.includes(user.uid) || project.userRole === 'admin' || project.userRole === 'manager';
      if (!canEdit) {
        toast.error('Você não tem permissão para editar esta tarefa');
        return;
      }

      // Atualizar a tarefa localmente
      const updatedTasks = project.tasks?.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ) || [];

      // Atualizar o projeto no Firebase
      await updateProject(projectId, { tasks: updatedTasks });

      // Registrar atividade no contexto de colaboração
      try {
        const collaborationData = await getCollaborationData(projectId, 'project');
        if (collaborationData) {
          const statusText = newStatus === 'completed' ? 'concluída' :
            newStatus === 'active' ? 'ativada' : 'marcada como pendente';

          await addActivity(collaborationData.id, {
            type: 'status_changed',
            userId: user.uid,
            userName: user.displayName || user.email || 'Usuário',
            description: `Tarefa "${task.title}" foi ${statusText}`,
            targetType: 'task',
            targetId: taskId,
            targetName: task.title,
            createdAt: new Date().toISOString(),
            metadata: {
              taskId,
              taskTitle: task.title,
              oldStatus: task.status,
              newStatus
            }
          });
        }
      } catch (activityError) {
        console.error('Erro ao registrar atividade:', activityError);
        // Não falhar a operação se não conseguir registrar a atividade
      }

      // Atualizar estado local
      setUserProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, tasks: updatedTasks }
            : p
        )
      );

      toast.success(`Status da tarefa atualizado para ${newStatus === 'completed' ? 'concluída' : newStatus === 'active' ? 'ativa' : 'pendente'}`);

    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      toast.error('Erro ao atualizar status da tarefa');
    }
  }, [user?.uid, user?.displayName, user?.email, userProjects]);

  // Obter tarefas de um usuário específico
  const getTasksForUser = useCallback((userId: string): Task[] => {
    const userTasks: Task[] = [];

    userProjects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          if (task.assignees.includes(userId)) {
            userTasks.push(task);
          }
        });
      }
    });

    return userTasks;
  }, [userProjects]);

  // Obter projetos que o usuário pode editar
  const getProjectsUserCanEdit = useCallback((): UserProjectData[] => {
    return userProjects.filter(project =>
      project.userRole === 'admin' ||
      project.userRole === 'manager' ||
      hasPermission('project', 'update')
    );
  }, [userProjects, hasPermission]);

  // Recarregar todos os dados
  const refreshData = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // Efeitos
  useEffect(() => {
    loadProjectsWithMembers();
  }, [loadProjectsWithMembers]);

  useEffect(() => {
    // Tentar carregar estatísticas do Firebase primeiro, usar cálculo local como fallback
    if (user?.uid) {
      loadStatsFromFirebase();
    }
  }, [loadStatsFromFirebase, user?.uid]);

  // Recalcular quando os projetos mudarem (fallback)
  useEffect(() => {
    calculateLocalStats();
  }, [calculateLocalStats]);

  return {
    userProjects,
    stats,
    loading: loading || projectsLoading,
    error,
    updateTaskStatus,
    refreshData,
    getTasksForUser,
    getProjectsUserCanEdit
  };
};
