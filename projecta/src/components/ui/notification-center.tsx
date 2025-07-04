import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Clock,
  AlertTriangle,
  User,
  FolderOpen,
  X,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationFilter } from '@/types/notification';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_deadline':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'task_status_change':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'task_assignment':
        return <User className="h-4 w-4 text-green-500" />;
      case 'project_assignment':
        return <FolderOpen className="h-4 w-4 text-purple-500" />;
      case 'overdue_task':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/10';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/10';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/10';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/10';
      default:
        return 'border-l-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getTimeAgo: (date: string) => string;
  getNotificationIcon: (type: Notification['type']) => React.ReactNode;
  getPriorityColor: (priority: Notification['priority']) => string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  getTimeAgo,
  getNotificationIcon,
  getPriorityColor
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'p-3 hover:bg-muted/50 transition-colors border-l-4 cursor-pointer group',
        getPriorityColor(notification.priority),
        !notification.isRead && 'bg-accent/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium truncate',
                !notification.isRead && 'font-semibold'
              )}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{getTimeAgo(notification.createdAt)}</span>
                {notification.priority === 'urgent' && (
                  <Badge variant="destructive" className="h-4 text-xs">
                    Urgente
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={cn(
              'flex items-center gap-1 ml-2 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-6 w-6"
                  title="Marcar como lida"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}

              {notification.actionUrl && (
                <Link href={notification.actionUrl}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Abrir"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="h-6 w-6 text-red-600 hover:text-red-700"
                title="Deletar"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}
