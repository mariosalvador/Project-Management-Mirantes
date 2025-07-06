import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Mail,
  Clock,
  Check,
  X,
  Users,
  Calendar
} from 'lucide-react';
import { TeamInvitation } from '@/Api/services/invites';
import { UserRole } from '@/types/collaboration';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingInvitesCardProps {
  invites: TeamInvitation[];
  onAcceptInvite: (inviteId: string) => Promise<void>;
  onDeclineInvite: (inviteId: string) => Promise<void>;
  loading?: boolean;
  showWelcomeMessage?: boolean;
}

const getRoleColor = (role: UserRole): string => {
  const colors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    member: 'bg-green-100 text-green-800 border-green-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[role] || colors.member;
};

const getRoleLabel = (role: UserRole): string => {
  const labels = {
    admin: 'Administrador',
    manager: 'Gerente',
    member: 'Membro',
    viewer: 'Visualizador'
  };
  return labels[role] || role;
};

export function PendingInvitesCard({
  invites,
  onAcceptInvite,
  onDeclineInvite,
  loading = false,
  showWelcomeMessage = false
}: PendingInvitesCardProps) {
  if (invites.length === 0) {
    return null;
  }

  const handleAccept = async (inviteId: string) => {
    try {
      await onAcceptInvite(inviteId);
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      await onDeclineInvite(inviteId);
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-blue-900">
              {showWelcomeMessage ? 'Bem-vindo! Você tem convites pendentes' : 'Convites de Equipe Pendentes'}
            </CardTitle>
            <CardDescription>
              {invites.length === 1
                ? '1 convite aguardando sua resposta'
                : `${invites.length} convites aguardando sua resposta`
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showWelcomeMessage && (
          <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-blue-800">
              🎉 Você foi convidado para participar de projetos! Aceite os convites abaixo para começar a colaborar.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  {/* Cabeçalho do convite */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-full">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {invite.projectTitle}
                    </h4>
                    <Badge
                      variant="outline"
                      className={getRoleColor(invite.role)}
                    >
                      {getRoleLabel(invite.role)}
                    </Badge>
                  </div>

                  {/* Informações do convite */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>Convidado por <strong>{invite.invitedByName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(invite.invitedAt), {
                          locale: ptBR,
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Expira {formatDistanceToNow(new Date(invite.expiresAt), {
                          locale: ptBR,
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações do convite */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invite.id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(invite.id)}
                    disabled={loading}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {invites.length > 1 && (
          <div className="pt-2 text-xs text-gray-500 text-center">
            💡 Dica: Você pode aceitar quantos convites desejar e participar de múltiplos projetos
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PendingInvitesCard;
