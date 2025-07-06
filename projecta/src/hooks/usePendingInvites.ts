import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPendingInvitesByEmail,
  checkPendingInvitesOnLogin,
  cleanupDuplicateInviteNotifications,
  TeamInvitation
} from '@/Api/services/invites';

export const usePendingInvites = () => {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar convites pendentes quando o usuário faz login
  const checkPendingInvites = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar convites pendentes por email
      const invites = await getPendingInvitesByEmail(user.email);
      setPendingInvites(invites);

      // Se há convites, verificar/criar notificações
      if (invites.length > 0) {
        await checkPendingInvitesOnLogin(user.email, user.uid, false);

        // Limpar possíveis notificações duplicadas
        await cleanupDuplicateInviteNotifications(user.uid);
      }

      return invites.length;
    } catch (err) {
      console.error('Erro ao verificar convites pendentes:', err);
      setError('Erro ao carregar convites pendentes');
      return 0;
    } finally {
      setLoading(false);
    }
  };

  // Forçar verificação de convites pendentes (útil para novos usuários)
  const forceCheckPendingInvites = async () => {
    if (!user?.email) return;

    try {
      const count = await checkPendingInvitesOnLogin(user.email, user.uid, true);
      await checkPendingInvites(); // Atualizar estado local
      return count;
    } catch (err) {
      console.error('Erro ao forçar verificação de convites:', err);
      return 0;
    }
  };

  // Verificar automaticamente quando o usuário é carregado
  useEffect(() => {
    if (user?.email) {
      checkPendingInvites();
    }
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    pendingInvites,
    loading,
    error,
    checkPendingInvites,
    forceCheckPendingInvites,
    hasPendingInvites: pendingInvites.length > 0
  };
};

export default usePendingInvites;
