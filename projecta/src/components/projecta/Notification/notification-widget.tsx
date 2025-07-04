import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Bell,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationStats } from '@/hooks/useTaskMonitoring';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getNotificationIcon, getPriorityStyle } from '@/utils/notification';

interface NotificationWidgetProps {
  className?: string;
  compact?: boolean;
}

export function NotificationWidget({ className, compact = false }: NotificationWidgetProps) {
  const { notifications, markAsRead } = useNotifications();
  const stats = useNotificationStats();

  // Apenas notificações não lidas e urgentes
  const urgentNotifications = notifications.filter(n =>
    !n.isRead && (n.priority === 'urgent' || n.priority === 'high')
  ).slice(0, compact ? 3 : 5);

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </div>
            {stats.needsAttention && (
              <Badge variant="destructive" className="h-5 text-xs">
                {stats.urgent + stats.overdue}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {urgentNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Tudo em dia!</p>
            </div>
          ) : (
            urgentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-2 rounded border-l-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  getPriorityStyle(notification.priority)
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {notification.actionUrl && (
                    <Link href={notification.actionUrl}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Urgentes
          </div>
          <div className="flex items-center gap-2">
            {stats.hasUrgentNotifications && (
              <Badge variant="destructive">
                {stats.urgent} urgente{stats.urgent !== 1 ? 's' : ''}
              </Badge>
            )}
            {stats.hasOverdueNotifications && (
              <Badge variant="destructive">
                {stats.overdue} vencida{stats.overdue !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Tudo em dia!</h3>
            <p className="text-sm">Não há notificações urgentes no momento.</p>
          </div>
        ) : (
          <>
            {urgentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  getPriorityStyle(notification.priority)
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>

                        {/* Metadata adicional */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            {new Date(notification.createdAt).toLocaleString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                          {notification.priority === 'urgent' && (
                            <Badge variant="destructive" className="h-4 text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Ação */}
                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Link para ver todas */}
            <div className="pt-2 border-t">
              <Button variant="ghost" className="w-full justify-center" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Widget compacto para sidebar
export function CompactNotificationWidget({ className }: { className?: string }) {
  return <NotificationWidget className={className} compact />;
}

// Indicador simples de notificações
export function NotificationIndicator({ className }: { className?: string }) {
  const stats = useNotificationStats();

  if (!stats.needsAttention) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="relative">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
      </div>
      <span className="text-xs text-muted-foreground">
        {stats.urgent + stats.overdue} urgente{stats.urgent + stats.overdue !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
