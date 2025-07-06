import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingInvites } from '@/hooks/usePendingInvites';
import { acceptInvite, declineInvite } from '@/Api/services/invites';
import { PendingInvitesCard } from './pending-invites-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PartyPopper,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface WelcomeWithInvitesProps {
  onDismiss?: () => void;
  autoShow?: boolean;
}

export function WelcomeWithInvites({ onDismiss, autoShow = true }: WelcomeWithInvitesProps) {
  const { user, userData } = useAuth();
  const { pendingInvites, hasPendingInvites, forceCheckPendingInvites } = usePendingInvites();
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAcceptedAny, setHasAcceptedAny] = useState(false);

  // Verificar se deve mostrar a mensagem de boas-vindas
  useEffect(() => {
    if (!autoShow || !user || !userData) return;

    // Verificar se é um usuário novo (criado recentemente)
    const isNewUser = userData.createdAt &&
      (new Date().getTime() - new Date(userData.createdAt).getTime()) < 5 * 60 * 1000; // 5 minutos

    if (isNewUser && hasPendingInvites) {
      setIsVisible(true);
    }
  }, [user, userData, hasPendingInvites, autoShow]);

  const handleAcceptInvite = async (inviteId: string) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await acceptInvite(inviteId, user.uid, user.email || '', user.displayName || 'Usuário');
      setHasAcceptedAny(true);
      toast.success('Convite aceito com sucesso!', {
        description: 'Você agora faz parte da equipe do projeto.'
      });

      // Atualizar lista de convites
      await forceCheckPendingInvites();
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro ao aceitar convite', {
        description: 'Tente novamente em alguns momentos.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setIsProcessing(true);
    try {
      await declineInvite(inviteId);
      toast.info('Convite recusado', {
        description: 'O convite foi removido da sua lista.'
      });

      // Atualizar lista de convites
      await forceCheckPendingInvites();
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      toast.error('Erro ao recusar convite', {
        description: 'Tente novamente em alguns momentos.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !hasPendingInvites) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Mensagem de boas-vindas */}
        <Card className="mb-4 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">
              Bem-vindo ao Projecta!
            </CardTitle>
            <CardDescription className="text-base">
              Sua conta foi criada com sucesso e você já tem convites de equipe aguardando!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-700">
                🚀 <strong>Ótimas notícias!</strong> Você foi convidado para participar de projetos.
                Aceite os convites abaixo para começar a colaborar com sua equipe.
              </p>
            </div>

            {hasAcceptedAny && (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-100 rounded-lg text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Parabéns! Você agora faz parte da equipe!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de convites pendentes */}
        <PendingInvitesCard
          invites={pendingInvites}
          onAcceptInvite={handleAcceptInvite}
          onDeclineInvite={handleDeclineInvite}
          loading={isProcessing}
          showWelcomeMessage={false}
        />

        {/* Botões de ação */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {pendingInvites.length > 0
                  ? 'Você pode aceitar convites a qualquer momento nas notificações'
                  : 'Todos os convites foram processados!'
                }
              </div>
              <div className="flex gap-2">
                {pendingInvites.length === 0 || hasAcceptedAny ? (
                  <Button onClick={handleDismiss}>
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleDismiss}>
                    Decidir depois
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WelcomeWithInvites;
