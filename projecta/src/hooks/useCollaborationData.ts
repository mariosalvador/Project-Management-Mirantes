"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { Project, Task } from '@/types/project';
import {
  getUserCollaborationStats,
  getProjectMembers,
  getCollaborationData,
  addActivity
} from '@/Api/services/collaboration';
import {
  getUserProjectsAsMember,
  updateTaskStatus as updateTaskStatusService,
  deleteTask as deleteTaskService
} from '@/Api/services/projects';
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
  lastUpdated: Date | null;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getTasksForUser: (userId: string) => Task[];
  getProjectsUserCanEdit: () => UserProjectData[];
}

export const useCollaborationData = (): UseCollaborationDataReturn => {
  const { user } = useAuth();
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Carregar projetos onde o usuário é membro através do email
  const loadUserProjectsAsMember = useCallback(async () => {
    if (!user?.email) {
      setUserProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberProjects = await getUserProjectsAsMember(user.email, user.displayName || '');
      const projectsWithMembers: UserProjectData[] = [];

      for (const project of memberProjects) {
        try {
          // Buscar membros detalhados do projeto (se houver sistema de membros separado)
          let members: ProjectMember[] = [];

          try {
            members = await getProjectMembers(project.id);
          } catch (memberError) {
            console.log("Sistema de membros não disponível, usando dados do team:", memberError);
            // Usar dados do team como fallback
            members = project.team?.map(teamMember => ({
              id: teamMember.id,
              userId: teamMember.id,
              email: teamMember.email || '',
              name: teamMember.name,
              avatar: teamMember.avatar,
              role: teamMember.role,
              projectId: project.id,
              joinedAt: new Date().toISOString(),
              isActive: true
            })) || [];
          }

          // Encontrar a role do usuário atual no projeto
          const userMember = members.find(member =>
            member.email?.toLowerCase() === user.email?.toLowerCase() ||
            member.name?.toLowerCase() === user.displayName?.toLowerCase()
          );

          const userRole = userMember?.role ||
            project.team?.find(t =>
              t.email?.toLowerCase() === user.email?.toLowerCase() ||
              t.name?.toLowerCase() === user.displayName?.toLowerCase()
            )?.role || 'member';


          projectsWithMembers.push({
            ...project,
            userRole,
            members
          });
        } catch (projectError) {
          console.error(`Erro ao carregar dados do projeto ${project.id}:`, projectError);
          // Adicionar projeto com dados básicos em caso de erro
          projectsWithMembers.push({
            ...project,
            userRole: 'member',
            members: []
          });
        }
      }

      setUserProjects(projectsWithMembers);
    } catch (err) {
      console.error('Erro ao carregar projetos como membro:', err);
      setError('Erro ao carregar projetos onde você é membro');
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.displayName]);

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
      setLastUpdated(new Date());
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

          // Verificar se o usuário está atribuído à tarefa (usar email ou displayName)
          const isUserAssigned = task.assignees.includes(user.email || '') ||
            task.assignees.includes(user.displayName || '') ||
            task.assignees.includes(user.uid);

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

          // Verificar tarefas atrasadas (apenas tarefas não concluídas)
          if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
            overdueTasks++;
          }
        });
      }
    });

    const myProgress = userTasks > 0 ? Math.round((userCompletedTasks / userTasks) * 100) : 0;

    const calculatedStats = {
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
    };

    setStats(calculatedStats);
    setLastUpdated(new Date());
  }, [user?.uid, user?.email, user?.displayName, userProjects]);

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
      setLastUpdated(new Date());
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
      const canEdit = task.assignees.includes(user.email || '') ||
        task.assignees.includes(user.displayName || '') ||
        project.userRole === 'admin' ||
        project.userRole === 'manager';

      if (!canEdit) {
        toast.error('Você não tem permissão para editar esta tarefa');
        return;
      }

      // Usar o serviço para atualizar no Firebase (passando o ID do usuário)
      await updateTaskStatusService(projectId, taskId, newStatus, user.uid);

      // Atualizar estado local
      setUserProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === projectId) {
            const updatedTasks = p.tasks?.map(t =>
              t.id === taskId ? { ...t, status: newStatus } : t
            ) || [];

            return {
              ...p,
              tasks: updatedTasks
            };
          }
          return p;
        })
      );

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
      }

      // Atualizar estado local
      setUserProjects(prev =>
        prev.map(p => {
          if (p.id === projectId) {
            const updatedTasks = p.tasks?.map(t =>
              t.id === taskId ? { ...t, status: newStatus } : t
            ) || [];
            return { ...p, tasks: updatedTasks };
          }
          return p;
        })
      );

      toast.success(`Status da tarefa atualizado para ${newStatus === 'completed' ? 'concluída' : newStatus === 'active' ? 'ativa' : 'pendente'}`);

    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      toast.error('Erro ao atualizar status da tarefa');
    }
  }, [user?.uid, user?.displayName, user?.email, userProjects]);

  // Deletar tarefa com registro de atividade
  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
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

      // Verificar se o usuário pode deletar esta tarefa
      const canDelete = task.assignees.includes(user.email || '') ||
        task.assignees.includes(user.displayName || '') ||
        project.userRole === 'admin' ||
        project.userRole === 'manager' ||
        project.createdBy === user.uid;

      if (!canDelete) {
        toast.error('Você não tem permissão para deletar esta tarefa');
        return;
      }

      // Usar o serviço para deletar no Firebase
      await deleteTaskService(projectId, taskId, user.uid);

      // Atualizar estado local
      setUserProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === projectId) {
            const updatedTasks = p.tasks?.filter(t => t.id !== taskId) || [];

            return {
              ...p,
              tasks: updatedTasks
            };
          }
          return p;
        })
      );

      toast.success('Tarefa deletada com sucesso!');

    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      toast.error('Erro ao deletar tarefa');
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
    await loadUserProjectsAsMember();
  }, [loadUserProjectsAsMember]);

  // Efeitos
  useEffect(() => {
    loadUserProjectsAsMember();
  }, [loadUserProjectsAsMember]);

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
    loading,
    error,
    lastUpdated,
    updateTaskStatus,
    deleteTask,
    refreshData,
    getTasksForUser,
    getProjectsUserCanEdit
  };
};
