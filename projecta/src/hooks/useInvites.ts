import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  sendTeamInvite,
  getProjectInvites,
  getUserInvites,
  cancelInvite,
  acceptInvite,
  declineInvite,
  TeamInvitation
} from '@/Api/services/invites';
import { UserRole } from '@/types/collaboration';

export const useInvites = (projectId?: string) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [userInvitations, setUserInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar convites do projeto
  const fetchProjectInvites = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Limpar erro anterior
      const invites = await getProjectInvites(projectId, user?.uid);
      setInvitations(invites);
    } catch (err) {
      const errorMessage = 'Erro ao carregar convites do projeto';
      setError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user?.uid]);

  // Buscar convites do usuário
  const fetchUserInvites = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const invites = await getUserInvites(user.email, user.email);
      setUserInvitations(invites);
    } catch (err) {
      setError('Erro ao carregar seus convites');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  // Enviar convite
  const sendInvite = async (
    email: string,
    role: UserRole,
    projectTitle: string
  ): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      setIsLoading(true);
      setError(null);

      if (email.toLowerCase().trim() === user.email?.toLowerCase().trim()) {
        setError('Você não pode enviar um convite para si mesmo');
        return false;
      }

      await sendTeamInvite(
        email,
        role,
        projectId,
        projectTitle,
        user.uid,
        user.displayName || user.email || 'Usuário',
        user.email || undefined
      );

      // Atualizar lista de convites
      await fetchProjectInvites();
      return true;
    } catch (err) {
      setError('Erro ao enviar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar convite
  const handleCancelInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await cancelInvite(inviteId);

      if (success) {
        setInvitations(prev => prev.filter(inv => inv.id !== inviteId));
      }

      return success;
    } catch (err) {
      setError('Erro ao cancelar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Aceitar convite
  const handleAcceptInvite = async (inviteId: string): Promise<boolean> => {
    if (!user?.uid || !user?.email) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setIsLoading(true);
      const userName = user.displayName || user.email || 'Usuário';
      const success = await acceptInvite(inviteId, user.uid, user.email, userName);

      if (success) {
        setUserInvitations(prev => prev.filter(inv => inv.id !== inviteId));
        // Atualizar convites do projeto se aplicável
        if (projectId) {
          await fetchProjectInvites();
        }
      }

      return success;
    } catch (err) {
      setError('Erro ao aceitar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Recusar convite
  const handleDeclineInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await declineInvite(inviteId);

      if (success) {
        setUserInvitations(prev => prev.filter(inv => inv.id !== inviteId));
      }

      return success;
    } catch (err) {
      setError('Erro ao recusar convite');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados automaticamente
  useEffect(() => {
    fetchProjectInvites();
  }, [fetchProjectInvites]);

  useEffect(() => {
    fetchUserInvites();
  }, [fetchUserInvites]);

  return {
    // Estados
    invitations,
    userInvitations,
    isLoading,
    error,

    // Ações
    sendInvite,
    cancelInvite: handleCancelInvite,
    acceptInvite: handleAcceptInvite,
    declineInvite: handleDeclineInvite,

    // Funções de atualização
    refetchProjectInvites: fetchProjectInvites,
    refetchUserInvites: fetchUserInvites,

    // Utilities
    clearError: () => setError(null)
  };
};
