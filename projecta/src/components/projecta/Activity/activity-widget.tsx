"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Clock,
  Bell
} from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';
import Link from 'next/link';
import { formatTimeAgo, getActivityTemplate } from '@/utils/formatters';

interface ActivityWidgetProps {
  className?: string;
  maxItems?: number;
}

export function ActivityWidget({ className, maxItems = 1 }: ActivityWidgetProps) {
  const { activities, unreadCount } = useActivity();
  const recentActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <CardTitle className="text-sm">Atividades Recentes</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs h-5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {recentActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const template = getActivityTemplate(activity.type);
              const description = template.getDescription(activity.data || {});

              return (
                <div
                  key={activity.id}
                  className={`flex gap-2 p-2 rounded-md transition-colors ${!activity.isRead
                      ? 'bg-blue-50/50 border border-blue-200'
                      : 'hover:bg-muted/50'
                    }`}
                >
                  {/* Ícone */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${template.color}`}>
                    {template.icon}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="text-xs font-medium truncate">
                        {template.title}
                      </h4>
                      {!activity.isRead && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={activity.userAvatar} />
                          <AvatarFallback className="text-xs">
                            {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.userName.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Link para ver todas */}
            <div className="pt-2 border-t">
              <Link href="/apk/activity">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  Ver todas as atividades
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
