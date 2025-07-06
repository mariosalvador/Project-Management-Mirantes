"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserInvites, 
  acceptInvite, 
  declineInvite, 
  TeamInvitation
} from '@/Api/services/invites';
import {
  Mail,
  Check,
  X,
  Calendar,
  User,
  Building,
  Clock,
  ChevronLeft,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserRole } from '@/types/collaboration';

// Helper para obter label da role
const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    member: 'Membro',
    viewer: 'Visualizador'
  };
  return roleLabels[role] || role;
};

export default function InviteDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const inviteId = params.inviteId as string;

  const [invite, setInvite] = useState<TeamInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvite = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const invites = await getUserInvites(user.email, user.email);
        const foundInvite = invites.find(inv => inv.id === inviteId);
        
        if (foundInvite) {
          setInvite(foundInvite);
        } else {
          setError('Convite não encontrado ou já foi processado.');
        }
      } catch (err) {
        console.error('Erro ao carregar convite:', err);
        setError('Erro ao carregar os detalhes do convite.');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [user?.email, inviteId]);

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;

    setProcessing(true);
    try {
      await acceptInvite(invite.id, user.uid, user.email || '', user.displayName || 'Usuário');
      toast.success('Convite aceito com sucesso!', {
        description: `Você agora faz parte da equipe do projeto "${invite.projectTitle}".`
      });
      router.push('/apk/team');
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro ao aceitar convite', {
        description: 'Tente novamente em alguns momentos.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!invite) return;

    setProcessing(true);
    try {
      await declineInvite(invite.id);
      toast.info('Convite recusado', {
        description: 'O convite foi removido da sua lista.'
      });
      router.push('/apk/team/invites');
    } catch (error) {
      console.error('Erro ao recusar convite:', error);
      toast.error('Erro ao recusar convite', {
        description: 'Tente novamente em alguns momentos.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const isExpired = invite && new Date() > new Date(invite.expiresAt);

  if (!user) {
    return (
      <div className="container space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Faça login para ver os detalhes do convite.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregando detalhes do convite...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="container space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/apk/team/invites">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar aos convites
            </Button>
          </Link>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Convite não encontrado</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link href="/apk/team/invites">
              <Button variant="outline">
                Ver todos os convites
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/apk/team/invites">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar aos convites
          </Button>
        </Link>
      </div>

      {/* Convite em destaque */}
      <Card className={`border-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isExpired ? 'bg-red-100' : 'bg-blue-100'}`}>
              <UserPlus className={`h-6 w-6 ${isExpired ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <CardTitle className={`text-xl ${isExpired ? 'text-red-900' : 'text-blue-900'}`}>
                {isExpired ? 'Convite Expirado' : 'Convite para Equipe'}
              </CardTitle>
              <CardDescription>
                {isExpired 
                  ? 'Este convite não está mais válido' 
                  : 'Você foi convidado para participar de um projeto'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isExpired && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                ⚠️ Este convite expirou em {formatDistanceToNow(new Date(invite.expiresAt), { locale: ptBR, addSuffix: true })}.
                Entre em contato com quem enviou o convite para solicitar um novo.
              </p>
            </div>
          )}

          {/* Detalhes do projeto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Projeto</p>
                <p className="text-lg font-semibold text-blue-900">{invite.projectTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Papel na equipe</p>
                <Badge variant="outline" className="mt-1">
                  {getRoleLabel(invite.role)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Convidado por</p>
                <p className="text-gray-700">{invite.invitedByName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Data do convite</p>
                <p className="text-gray-700">
                  {formatDistanceToNow(new Date(invite.invitedAt), { 
                    locale: ptBR, 
                    addSuffix: true 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Válido até</p>
                <p className={`${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                  {formatDistanceToNow(new Date(invite.expiresAt), { 
                    locale: ptBR, 
                    addSuffix: true 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          {!isExpired && (
            <div className="flex gap-4 pt-4 border-t">
              <Button
                onClick={handleAcceptInvite}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {processing ? 'Aceitando...' : 'Aceitar Convite'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDeclineInvite}
                disabled={processing}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                {processing ? 'Recusando...' : 'Recusar Convite'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">O que acontece quando aceito o convite?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Você se tornará membro da equipe do projeto</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Terá acesso às tarefas e atividades do projeto</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Poderá colaborar com outros membros da equipe</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Receberá notificações sobre atualizações do projeto</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
