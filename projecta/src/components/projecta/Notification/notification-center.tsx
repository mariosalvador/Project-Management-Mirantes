import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  FolderOpen,
  X,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationFilter } from '@/types/notification';
import { cn } from '@/lib/utils';
import { getPriorityColor } from '@/utils/tasksFormatters';
import { getNotificationIcon, getTimeAgo } from '@/utils/notification';
import { NotificationItem } from './notification-item';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    stats,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const filterButtons: Array<{
    key: NotificationFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
      { key: 'all', label: 'Todas', icon: Bell, count: stats.total },
      { key: 'unread', label: 'Não lidas', icon: Bell, count: stats.unread },
      { key: 'urgent', label: 'Urgentes', icon: AlertTriangle, count: stats.urgent },
      { key: 'task_related', label: 'Tarefas', icon: CheckCheck },
      { key: 'project_related', label: 'Projetos', icon: FolderOpen }
    ];

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {stats.unread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[600px] shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                  {stats.unread > 0 && (
                    <Badge variant="secondary">{stats.unread}</Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-1 mt-3">
                {filterButtons.map((filterBtn) => {
                  const Icon = filterBtn.icon;
                  return (
                    <Button
                      key={filterBtn.key}
                      variant={filter === filterBtn.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(filterBtn.key)}
                      className="h-7 text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {filterBtn.label}
                      {filterBtn.count !== undefined && filterBtn.count > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 text-xs">
                          {filterBtn.count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteReadNotifications}
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar lidas
                  </Button>
                </div>
              )}
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      {filter === 'all'
                        ? 'Nenhuma notificação encontrada'
                        : `Nenhuma notificação ${filter === 'unread' ? 'não lida' : 'do tipo selecionado'}`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getTimeAgo={getTimeAgo}
                        getNotificationIcon={getNotificationIcon}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Footer */}
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações de notificação
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}