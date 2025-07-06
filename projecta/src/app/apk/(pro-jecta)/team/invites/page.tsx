"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast';
import {
  Mail,
  Check,
  X,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInvites } from '@/hooks/useInvites';
import { formatLastActive, getRoleIcon, getRoleLabel } from '@/utils/userUtils';

export default function UserInvitesPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const {
    userInvitations,
    acceptInvite,
    declineInvite,
    isLoading,
    error
  } = useInvites();

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const success = await acceptInvite(inviteId);
      if (success) {
        showToast("Convite aceito com sucesso! Você agora faz parte da equipe.", "success");
      } else {
        showToast("Erro ao aceitar convite. Tente novamente.", "error");
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      showToast("Erro ao aceitar convite. Tente novamente.", "error");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const success = await declineInvite(inviteId);
      if (success) {
        showToast("Convite recusado.", "success");
      } else {
        showToast("Erro ao recusar convite. Tente novamente.", "error");
      }
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      showToast("Erro ao recusar convite. Tente novamente.", "error");
    }
  };

  if (!user) {
    return (
      <div className="container space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Faça login para ver seus convites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="h-8 w-8" />
            Meus Convites
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os convites que você recebeu para participar de projetos
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Convites */}
      {userInvitations.length > 0 ? (
        <div className="grid gap-4">
          {userInvitations.map((invitation) => (
            <Card key={invitation.id} className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{invitation.projectTitle}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          Convidado por {invitation.invitedByName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(invitation.role)}
                        <span className="font-medium">Função: {getRoleLabel(invitation.role)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Convidado em {formatLastActive(invitation.invitedAt)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Expira em {formatLastActive(invitation.expiresAt)}
                      </div>
                    </div>

                    <Badge variant="secondary">Pendente</Badge>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleAcceptInvite(invitation.id)}
                      disabled={isLoading}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Check className="h-4 w-4" />
                      Aceitar
                    </Button>

                    <Button
                      onClick={() => handleDeclineInvite(invitation.id)}
                      disabled={isLoading}
                      variant="outline"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                      Recusar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum convite pendente</h3>
              <p className="text-sm">
                Você não tem convites pendentes no momento.
              </p>
              <p className="text-sm mt-1">
                Quando alguém te convidar para um projeto, os convites aparecerão aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <p>Processando convite...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toast de notificações */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
