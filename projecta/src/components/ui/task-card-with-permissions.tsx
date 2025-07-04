"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  UserPlus,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Users,
  Flag
} from 'lucide-react';
import { Task } from '@/types/project';
import { usePermissions } from '@/hooks/usePermissions';
import { getPriorityColor, getPriorityLabel, getTaskStatusLabel } from '@/utils/tasksFormatters';
import { cn } from '@/lib/utils';
import { CommentSection } from '../projecta/Comment/comment-section';
import { formatDate } from '@/utils/formatDate';

interface TaskCardWithPermissionsProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (taskId: string, userId: string) => void;
  projectTitle: string;
  className?: string;
}

export function TaskCardWithPermissions({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
  projectTitle,
  className
}: TaskCardWithPermissionsProps) {
  const { hasPermission, currentUser, users } = usePermissions();
  const [showComments, setShowComments] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const canEdit = hasPermission('task', 'update');
  const canDelete = hasPermission('task', 'delete');
  const canAssign = hasPermission('task', 'assign');
  const canComment = hasPermission('task', 'comment');

  const handleStatusChange = (newStatus: Task['status']) => {
    if (hasPermission('task', 'update')) {
      onStatusChange(task.id, newStatus);
    }
  };

  const assignedUsers = users.filter(user =>
    task.assignees.includes(user.id) || task.assignees.includes(user.name)
  );

  const unassignedUsers = users.filter(user =>
    !task.assignees.includes(user.id) && !task.assignees.includes(user.name)
  );

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={cn(
      "w-full transition-all hover:shadow-lg",
      isOverdue && "border-red-300 bg-red-50 dark:bg-red-950/10",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {task.description}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-1 ml-2">
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Metadados da tarefa */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue && <Badge variant="destructive" className="text-xs">Vencida</Badge>}
            </div>

            {task.priority && (
              <div className="flex items-center gap-1">
                <Flag className={cn("h-3 w-3", getPriorityColor(task.priority))} />
                <span>{getPriorityLabel(task.priority)}</span>
              </div>
            )}

            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{getTaskStatusLabel(task.status)}</Badge>
            {canEdit && (
              <div className="flex gap-1">
                {(['pending', 'active', 'completed'] as Task['status'][]).map((status) => (
                  <Button
                    key={status}
                    variant={task.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    className="text-xs px-2 py-1"
                  >
                    {getTaskStatusLabel(status)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Responsáveis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Responsáveis</span>
            </div>
            {canAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAssigning(!isAssigning)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Lista de responsáveis */}
          {assignedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum responsável atribuído</p>
          )}

          {/* Interface de atribuição */}
          {isAssigning && canAssign && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Atribuir usuários:</p>
              <div className="flex flex-wrap gap-2">
                {unassignedUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign?.(task.id, user.id)}
                    className="text-xs"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {user.name}
                  </Button>
                ))}
              </div>
              {unassignedUsers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Todos os usuários já estão atribuídos
                </p>
              )}
            </div>
          )}
        </div>

        {/* Comentários */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="w-full justify-start"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {showComments ? 'Ocultar' : 'Ver'} Comentários
          </Button>

          {showComments && canComment && (
            <div className="mt-3">
              <CommentSection taskId={task.id} />
            </div>
          )}
        </div>

        {/* Informações de criação/atualização */}
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p>Projeto: {projectTitle}</p>
          {currentUser && (
            <p>Visualizando como: {currentUser.name} ({currentUser.role})</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
