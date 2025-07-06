"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  FolderOpen,
  Settings,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';
import { NotificationSettingsPanel } from './notification-settings';

interface NotificationDashboardProps {
  className?: string;
}

export function NotificationDashboard({ className }: NotificationDashboardProps) {
  const {
    notifications,
    stats,
    markAllAsRead
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'overview' | 'center' | 'settings'>('overview');

  const getRecentNotifications = () => {
    return notifications
      .filter(n => !n.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getNotificationsByType = () => {
    const types = {
      task_deadline: 0,
      overdue_task: 0,
      task_assignment: 0,
      project_assignment: 0,
      task_status_change: 0,
      project_update: 0,
      team_invitation: 0
    };

    notifications.forEach(n => {
      if (types[n.type as keyof typeof types] !== undefined) {
        types[n.type as keyof typeof types]++;
      }
    });

    return types;
  };

  const typeStats = getNotificationsByType();
  const recentNotifications = getRecentNotifications();

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Central de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e configurações
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Bell className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.unread}</p>
                    <p className="text-sm text-muted-foreground">Não Lidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.urgent}</p>
                    <p className="text-sm text-muted-foreground">Urgentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={markAllAsRead} size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar Todas como Lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Lidas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Notificações por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Prazos de Tarefas</span>
                  </div>
                  <Badge variant="secondary">{typeStats.task_deadline}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Tarefas Vencidas</span>
                  </div>
                  <Badge variant="destructive">{typeStats.overdue_task}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Atribuições de Tarefas</span>
                  </div>
                  <Badge variant="secondary">{typeStats.task_assignment}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-purple-500" />
                    <span>Atribuições de Projetos</span>
                  </div>
                  <Badge variant="secondary">{typeStats.project_assignment}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Notificações Recentes (Não Lidas)</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma notificação não lida
                </p>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className="text-sm">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === 'settings' && (
        <NotificationSettingsPanel />
      )}
    </div>
  );
}
