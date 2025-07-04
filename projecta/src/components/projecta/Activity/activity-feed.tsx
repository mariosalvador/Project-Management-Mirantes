"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Calendar,
  Filter,
  Search,
  Bell,
  BellOff,
  Clock,
  RefreshCw,
  CheckCheck,
  X
} from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';
import { ActivityType } from '@/types/activity';
import { formatTimeAgo, getActivityTemplate } from '@/utils/formatters';

interface ActivityFeedProps {
  className?: string;
  showFilters?: boolean;
  maxItems?: number;
  projectId?: string; // Para filtrar apenas atividades de um projeto específico
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  project_created: 'Projeto criado',
  project_updated: 'Projeto atualizado',
  project_status_changed: 'Status do projeto',
  task_created: 'Tarefa criada',
  task_updated: 'Tarefa atualizada',
  task_status_changed: 'Status da tarefa',
  task_assigned: 'Tarefa atribuída',
  task_unassigned: 'Tarefa desatribuída',
  comment_added: 'Comentário adicionado',
  comment_updated: 'Comentário editado',
  comment_deleted: 'Comentário removido',
  user_added: 'Membro adicionado',
  user_removed: 'Membro removido',
  user_role_changed: 'Função alterada',
  milestone_completed: 'Marco concluído',
  file_uploaded: 'Arquivo enviado',
  file_deleted: 'Arquivo removido'
};

export function ActivityFeed({ className, showFilters = true, maxItems, projectId }: ActivityFeedProps) {
  const {
    groupedActivities,
    unreadCount,
    updateFilters,
    clearFilters,
    markAsRead,
    markAllAsRead
  } = useActivity();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Filtrar atividades por projeto se especificado
  React.useEffect(() => {
    if (projectId) {
      updateFilters({ projectId });
    }
  }, [projectId, updateFilters]);

  // Aplicar filtros locais
  React.useEffect(() => {
    const newFilters: Record<string, unknown> = {};

    if (selectedTypes.length > 0) {
      newFilters.type = selectedTypes;
    }

    if (showOnlyUnread) {
      newFilters.onlyUnread = true;
    }

    updateFilters(newFilters);
  }, [selectedTypes, showOnlyUnread, updateFilters]);

  // Filtrar por termo de busca
  const filteredGroups = groupedActivities.map(group => ({
    ...group,
    activities: group.activities.filter(activity =>
      searchTerm === '' ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.activities.length > 0);

  // Limitar número de itens se especificado
  const limitedGroups = maxItems
    ? filteredGroups.slice(0, Math.min(maxItems, filteredGroups.length))
    : filteredGroups;

  const handleTypeFilter = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setShowOnlyUnread(false);
    setSearchTerm('');
    clearFilters();
  };


  const hasActiveFilters = selectedTypes.length > 0 || showOnlyUnread || searchTerm !== '';

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Feed de Atividades</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {unreadCount} não lidas
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>

                <Button
                  variant={showOnlyUnread ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className="text-xs"
                >
                  {showOnlyUnread ? <BellOff className="h-3 w-3 mr-1" /> : <Bell className="h-3 w-3 mr-1" />}
                  Não lidas
                </Button>

                {/* Filtros por tipo de atividade */}
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([type, label]) => (
                  <Button
                    key={type}
                    variant={selectedTypes.includes(type as ActivityType) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeFilter(type as ActivityType)}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {limitedGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-sm">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para ver mais atividades"
                  : "As atividades do projeto aparecerão aqui"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {limitedGroups.map((group) => (
                <div key={group.date}>
                  {/* Header do grupo de data */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {group.date}
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  {/* Lista de atividades */}
                  <div className="space-y-3">
                    {group.activities.map((activity) => {
                      const template = getActivityTemplate(activity.type);
                      const description = template.getDescription(activity.data || {});

                      return (
                        <div
                          key={activity.id}
                          className={`flex gap-3 p-3 rounded-lg border transition-colors ${!activity.isRead
                              ? 'bg-blue-50/50 border-blue-200'
                              : 'bg-background hover:bg-muted/50'
                            }`}
                          onClick={() => !activity.isRead && markAsRead(activity.id)}
                        >
                          {/* Ícone da atividade */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${template.color}`}>
                            {template.icon}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {template.title}
                                  </h4>
                                  {!activity.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(activity.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Autor */}
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={activity.userAvatar} />
                                <AvatarFallback className="text-xs">
                                  {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {activity.userName}
                              </span>
                              {activity.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  Alta prioridade
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
