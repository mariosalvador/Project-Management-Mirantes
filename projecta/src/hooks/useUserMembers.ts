import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  sendMemberInvite,
  acceptMemberInvite,
  declineMemberInvite,
  cancelMemberInvite,
  getUserMembers,
  getSentMemberInvites,
  getReceivedMemberInvites,
  removeUserMember,
  updateMemberDefaultRole,
  getMemberStats,
  assignMemberToProject,
  removeMemberFromProject as removeFromProject,
  getProjectMembers,
  assignMemberToTask,
  removeMemberFromTask as removeFromTask,
  getTaskMembers
} from '@/Api/services/userMembers';
import {
  UserMember,
  MemberInvitation,
  MemberStats,
  ProjectMemberAssignment,
  TaskMemberAssignment
} from '@/types/userMembers';
import { UserRole } from '@/types/collaboration';

export const useUserMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserMember[]>([]);
  const [sentInvites, setSentInvites] = useState<MemberInvitation[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<MemberInvitation[]>([]);
  const [stats, setStats] = useState<MemberStats>({
    total: 0,
    active: 0,
    pending: 0,
    byRole: { admin: 0, manager: 0, member: 0, viewer: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar membros do usuário
  const fetchMembers = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);
      const userMembers = await getUserMembers(user.uid);
      setMembers(userMembers);
    } catch (err) {
      const errorMessage = 'Erro ao carregar membros';
      setError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Buscar convites enviados
  const fetchSentInvites = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const invites = await getSentMemberInvites(user.uid);
      setSentInvites(invites);
    } catch (err) {
      console.error('Erro ao carregar convites enviados:', err);
    }
  }, [user?.uid]);

  // Buscar convites recebidos
  const fetchReceivedInvites = useCallback(async () => {
    if (!user?.email) return;

    try {
      const invites = await getReceivedMemberInvites(user.email);
      setReceivedInvites(invites);
    } catch (err) {
      console.error('Erro ao carregar convites recebidos:', err);
    }
  }, [user?.email]);

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const memberStats = await getMemberStats(user.uid);
      setStats(memberStats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [user?.uid]);

  // Enviar convite para membro
  const sendInvite = async (
    email: string,
    defaultRole: UserRole,
    message?: string
  ): Promise<boolean> => {
    if (!user?.uid || !user?.email) {
      setError('Dados do usuário incompletos. Faça login novamente.');
      return false;
    }

    // Usar email como fallback se displayName for null
    const userName = user.displayName || user.email || 'Usuário';

    try {
      setIsLoading(true);
      setError(null);

      await sendMemberInvite(
        email,
        defaultRole,
        user.uid,
        userName,
        user.email,
        message
      );

      // Atualizar listas
      await fetchSentInvites();
      await fetchStats();
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Erro ao enviar convite';
      console.error('Erro detalhado ao enviar convite:', err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar convite enviado
  const cancelInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await cancelMemberInvite(inviteId);

      if (success) {
        setSentInvites(prev => prev.filter(inv => inv.id !== inviteId));
        await fetchStats();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao cancelar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Aceitar convite recebido
  const acceptInvite = async (inviteId: string): Promise<boolean> => {
    if (!user?.uid || !user?.email) return false;

    const userName = user.displayName || user.email || 'Usuário';

    try {
      setIsLoading(true);
      const success = await acceptMemberInvite(
        inviteId,
        user.uid,
        user.email,
        userName
      );

      if (success) {
        setReceivedInvites(prev => prev.filter(inv => inv.id !== inviteId));
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao aceitar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Recusar convite recebido
  const declineInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await declineMemberInvite(inviteId);

      if (success) {
        setReceivedInvites(prev => prev.filter(inv => inv.id !== inviteId));
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao recusar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover membro
  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await removeUserMember(memberId);

      if (success) {
        await fetchMembers();
        await fetchStats();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao remover membro');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar papel padrão do membro
  const updateRole = async (memberId: string, newRole: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await updateMemberDefaultRole(memberId, newRole);

      if (success) {
        await fetchMembers();
        await fetchStats();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao atualizar papel do membro');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados automaticamente
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchSentInvites();
  }, [fetchSentInvites]);

  useEffect(() => {
    fetchReceivedInvites();
  }, [fetchReceivedInvites]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Estados
    members,
    sentInvites,
    receivedInvites,
    stats,
    isLoading,
    error,

    // Ações de convite
    sendInvite,
    cancelInvite,
    acceptInvite,
    declineInvite,

    // Ações de membro
    removeMember,
    updateRole,

    // Funções de atualização
    refetchMembers: fetchMembers,
    refetchSentInvites: fetchSentInvites,
    refetchReceivedInvites: fetchReceivedInvites,
    refetchStats: fetchStats,

    // Utilities
    clearError: () => setError(null)
  };
};

// Hook para gestão de membros em projetos
export const useProjectMemberManagement = (projectId: string) => {
  const { user } = useAuth();
  const { members: userMembers } = useUserMembers();
  const [projectMembers, setProjectMembers] = useState<ProjectMemberAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar membros do projeto
  const fetchProjectMembers = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const members = await getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (err) {
      setError('Erro ao carregar membros do projeto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Adicionar membro ao projeto
  const addMemberToProject = async (
    memberUserId: string,
    assignedRole: UserRole
  ): Promise<boolean> => {
    if (!user?.uid) return false;

    const userName = user.displayName || user.email || 'Usuário';
    const member = userMembers.find(m => m.memberUserId === memberUserId);
    if (!member) return false;

    try {
      setIsLoading(true);
      const success = await assignMemberToProject(
        projectId,
        'Projeto', 
        member.memberUserId,
        member.memberName,
        member.memberEmail,
        assignedRole,
        userName
      );

      if (success) {
        await fetchProjectMembers();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao adicionar membro ao projeto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover membro do projeto
  const removeMemberFromProject = async (memberUserId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await removeFromProject(projectId, memberUserId);

      if (success) {
        await fetchProjectMembers();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao remover membro do projeto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Membros disponíveis para adicionar ao projeto
  const availableMembers = userMembers.filter(member =>
    !projectMembers.some(pm => pm.memberUserId === member.memberUserId)
  );

  useEffect(() => {
    fetchProjectMembers();
  }, [fetchProjectMembers]);

  return {
    projectMembers,
    availableMembers,
    isLoading,
    error,
    addMemberToProject,
    removeMemberFromProject,
    refetchProjectMembers: fetchProjectMembers,
    clearError: () => setError(null)
  };
};

// Hook para gestão de membros em tarefas
export const useTaskMemberManagement = (taskId: string, projectId: string) => {
  const { user } = useAuth();
  const { projectMembers } = useProjectMemberManagement(projectId);
  const [taskMembers, setTaskMembers] = useState<TaskMemberAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar membros da tarefa
  const fetchTaskMembers = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const members = await getTaskMembers(taskId);
      setTaskMembers(members);
    } catch (err) {
      setError('Erro ao carregar membros da tarefa');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Adicionar membro à tarefa
  const addMemberToTask = async (memberUserId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    const userName = user.displayName || user.email || 'Usuário';
    const projectMember = projectMembers.find(m => m.memberUserId === memberUserId);
    if (!projectMember) return false;

    try {
      setIsLoading(true);
      const success = await assignMemberToTask(
        taskId,
        'Tarefa',
        projectId,
        projectMember.memberUserId,
        projectMember.memberName,
        projectMember.memberEmail,
        userName
      );

      if (success) {
        await fetchTaskMembers();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao adicionar membro à tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover membro da tarefa
  const removeMemberFromTask = async (memberUserId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await removeFromTask(taskId, memberUserId);

      if (success) {
        await fetchTaskMembers();
      }

      return success;
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao remover membro da tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Membros disponíveis para adicionar à tarefa (apenas membros do projeto)
  const availableMembers = projectMembers.filter(member =>
    !taskMembers.some(tm => tm.memberUserId === member.memberUserId)
  );

  useEffect(() => {
    fetchTaskMembers();
  }, [fetchTaskMembers]);

  return {
    taskMembers,
    availableMembers,
    isLoading,
    error,
    addMemberToTask,
    removeMemberFromTask,
    refetchTaskMembers: fetchTaskMembers,
    clearError: () => setError(null)
  };
};
