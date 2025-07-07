import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/collaboration';
import {
  ProjectMember,
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMemberFromProject,
  updateMemberActivity,
  isUserProjectMember,
  getUserProjectRole
} from '@/Api/services/projectMembers';

export const useProjectMembers = (projectId: string) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  // Buscar membros do projeto
  const fetchMembers = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);
      const projectMembers = await getProjectMembers(projectId);
      setMembers(projectMembers);

      // Se o projeto não tem membros e temos um usuário logado, criar como admin
      if (projectMembers.length === 0 && user?.uid && user?.email) {
        const success = await addProjectMember(
          projectId,
          user.uid,
          user.email,
          user.displayName || user.email,
          'admin'
        );

        if (success) {
          // Recarregar membros após criar o admin
          const updatedMembers = await getProjectMembers(projectId);
          setMembers(updatedMembers);
        }
      }
    } catch (err) {
      setError('Erro ao carregar membros do projeto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user?.uid, user?.email, user?.displayName]);

  // Obter role do usuário atual
  const fetchCurrentUserRole = useCallback(async () => {
    if (!projectId || !user?.uid) return;

    try {
      const role = await getUserProjectRole(projectId, user.uid);
      setCurrentUserRole(role);
    } catch (err) {
      console.error('Erro ao obter role do usuário:', err);
      setCurrentUserRole(null);
    }
  }, [projectId, user?.uid]);

  // Adicionar membro ao projeto
  const addMember = async (
    userId: string,
    email: string,
    name: string,
    role: UserRole,
    avatar?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await addProjectMember(projectId, userId, email, name, role, avatar);

      if (success) {
        await fetchMembers(); // Recarregar lista
      }

      return success;
    } catch (err) {
      setError('Erro ao adicionar membro');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar role de um membro
  const updateRole = async (memberId: string, newRole: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await updateMemberRole(memberId, newRole);

      if (success) {
        // Atualizar estado local
        setMembers(prev =>
          prev.map(member =>
            member.id === memberId
              ? { ...member, role: newRole }
              : member
          )
        );
      }

      return success;
    } catch (err) {
      setError('Erro ao atualizar role');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover membro do projeto
  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await removeMemberFromProject(memberId);

      if (success) {
        // Remover do estado local
        setMembers(prev => prev.filter(member => member.id !== memberId));
      }

      return success;
    } catch (err) {
      setError('Erro ao remover membro');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar atividade do usuário atual
  const updateActivity = useCallback(async () => {
    if (!projectId || !user?.uid) return;

    try {
      await updateMemberActivity(projectId, user.uid);
    } catch (err) {
      console.error('Erro ao atualizar atividade:', err);
    }
  }, [projectId, user?.uid]);

  // Verificar se o usuário é membro
  const checkMembership = useCallback(async (): Promise<boolean> => {
    if (!projectId || !user?.uid) return false;

    try {
      return await isUserProjectMember(projectId, user.uid);
    } catch (err) {
      console.error('Erro ao verificar membership:', err);
      return false;
    }
  }, [projectId, user?.uid]);

  // Verificar permissões
  const hasPermission = (action: 'view' | 'create' | 'update' | 'delete'): boolean => {
    if (!currentUserRole) return false;

    switch (action) {
      case 'view':
        return ['viewer', 'member', 'manager', 'admin'].includes(currentUserRole);
      case 'create':
        return ['manager', 'admin'].includes(currentUserRole);
      case 'update':
        return ['manager', 'admin'].includes(currentUserRole);
      case 'delete':
        return ['admin'].includes(currentUserRole);
      default:
        return false;
    }
  };

  // Encontrar membro atual
  const currentMember = members.find(member => member.userId === user?.uid);

  // Estatísticas
  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    recentActivity: members.filter(m => {
      if (!m.lastActive) return false;
      const lastActive = new Date(m.lastActive);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return lastActive > yesterday;
    }).length,
    byRole: {
      admin: members.filter(m => m.role === 'admin').length,
      manager: members.filter(m => m.role === 'manager').length,
      member: members.filter(m => m.role === 'member').length,
      viewer: members.filter(m => m.role === 'viewer').length,
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (projectId) {
      const loadData = async () => {
        await fetchMembers();
        await fetchCurrentUserRole();
      };
      loadData();
    }
  }, [projectId, fetchMembers, fetchCurrentUserRole]);

  // Atualizar atividade periodicamente
  useEffect(() => {
    if (!projectId || !user?.uid) return;

    // Atualizar atividade ao montar o componente
    updateActivity();

    // Atualizar atividade a cada 5 minutos
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [projectId, user?.uid, updateActivity]);

  return {
    members,
    currentMember,
    currentUserRole,
    isLoading,
    error,
    stats,
    hasPermission,
    addMember,
    updateRole,
    removeMember,
    updateActivity,
    checkMembership,
    refreshMembers: fetchMembers,
    clearError: () => setError(null)
  };
};
