"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkTaskDeadlines } from '@/Api/services/deadlineNotifications';

export function DeadlineChecker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Verificar prazos quando o usuário faz login
    const checkDeadlines = async () => {
      try {
        await checkTaskDeadlines();
      } catch (error) {
        console.error('Erro ao verificar prazos:', error);
      }
    };

    // Executar verificação inicial após 5 segundos (para permitir que o app carregue)
    const initialTimeout = setTimeout(checkDeadlines, 5000);

    // Verificar prazos a cada 6 horas
    const interval = setInterval(checkDeadlines, 6 * 60 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user]);

  return null;
}
