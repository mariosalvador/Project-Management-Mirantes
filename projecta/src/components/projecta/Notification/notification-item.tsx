import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { NotificationItemProps } from '@/types/notification';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  getTimeAgo,
  getNotificationIcon,
  getPriorityColor
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleNotificationClick = () => {
    // Marcar como lida se não estiver lida
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Redirecionar para a URL de ação se existir
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div
      className={cn(
        'p-3 hover:bg-muted/50 transition-colors border-l-4 cursor-pointer group',
        getPriorityColor(notification.priority),
        !notification.isRead && 'bg-accent/20',
        notification.type === 'team_invitation' && 'hover:bg-blue-50 border-l-blue-500'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNotificationClick}
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

              {/* Indicador especial para convites */}
              {notification.type === 'team_invitation' && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  👆 Clique para responder ao convite
                </p>
              )}

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(notification.actionUrl, '_blank');
                  }}
                  className="h-6 w-6"
                  title="Abrir"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
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
