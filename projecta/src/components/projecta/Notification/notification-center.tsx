import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationFilter } from '@/types/notification';
import { getPriorityColor } from '@/utils/tasksFormatters';
import { getNotificationIcon, getTimeAgo } from '@/utils/notification';
import { NotificationItem } from './notification-item';


export function NotificationCenter() {
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Estado local para filtro simples
  const [currentFilter, setCurrentFilter] = useState<NotificationFilter>('all');

  // Filtrar notificações localmente
  const filteredNotifications = notifications.filter(notification => {
    switch (currentFilter) {
      case 'unread':
        return !notification.isRead;
      case 'urgent':
        return notification.priority === 'urgent' || notification.priority === 'high';
      case 'task_related':
        return ['task_deadline', 'task_assignment', 'task_status_change', 'overdue_task'].includes(notification.type);
      case 'project_related':
        return ['project_assignment', 'project_update'].includes(notification.type);
      default:
        return true;
    }
  });

  // Função para deletar notificações lidas
  const deleteReadNotifications = () => {
    const readNotifications = notifications.filter(n => n.isRead);
    readNotifications.forEach(notification => {
      deleteNotification(notification.id);
    });
  };

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
    <Dialog>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {stats.unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {stats.unread > 99 ? '99+' : stats.unread}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className={""}>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
                {stats.unread > 0 && (
                  <Badge variant="secondary">{stats.unread}</Badge>
                )}
              </div>
            </div>
          </DialogTitle>

          <DialogDescription>
            <div className="flex flex-wrap gap-1 mt-3">
              {filterButtons.map((filterBtn) => {
                const Icon = filterBtn.icon;
                return (
                  <Button
                    key={filterBtn.key}
                    variant={currentFilter === filterBtn.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentFilter(filterBtn.key)}
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

            {filteredNotifications.length > 0 && (
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

            <Separator />

            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {currentFilter === 'all'
                      ? 'Nenhuma notificação encontrada'
                      : `Nenhuma notificação ${currentFilter === 'unread' ? 'não lida' : 'do tipo selecionado'}`
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
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
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog >
  )
}
