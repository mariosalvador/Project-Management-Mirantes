/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Send,
  Eye,
  Bell,
  BellOff
} from 'lucide-react';
import { Task } from '@/types/project';
import { TaskWithCollaboration } from '@/types/collaboration';
import { usePermissions } from '@/hooks/usePermissions';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { formatDate } from '@/utils/formatDate';
import { CommentSection } from '../Comment/comment-section';
import { cn } from '@/lib/utils';

interface TaskCollaborationProps {
  task: TaskWithCollaboration;
  projectId: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onAssignUser?: (taskId: string, userId: string) => void;
  onUnassignUser?: (taskId: string, userId: string) => void;
  onUpdateWatchers?: (taskId: string, watcherIds: string[]) => void;
  className?: string;
}

export function TaskCollaboration({
  task,
  projectId,
  onTaskUpdate,
  onAssignUser,
  onUnassignUser,
  onUpdateWatchers,
  className
}: TaskCollaborationProps) {
  const { hasPermission, currentUser, users } = usePermissions();
  const { logTaskAssigned, logTaskUpdated } = useActivityLogger();

  const [showComments, setShowComments] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [isWatching, setIsWatching] = useState(
    task.watchers?.includes(currentUser?.id || '') || false
  );

  const canEdit = hasPermission('task', 'update');
  const canAssign = hasPermission('task', 'assign');

  // Usuários atribuídos à tarefa
  const assignedUsers = users.filter(user =>
    task.assignees.includes(user.id) || task.assignees.includes(user.name)
  );

  // Usuários disponíveis para atribuição
  const availableUsers = users.filter(user =>
    !task.assignees.includes(user.id) && !task.assignees.includes(user.name)
  );

  // Observadores da tarefa
  const watchers = users.filter(user =>
    task.watchers?.includes(user.id)
  );

  const handleAssignUser = (userId: string) => {
    if (onAssignUser) {
      onAssignUser(task.id, userId);
      logTaskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        projectId: projectId,
        projectTitle: 'Projeto' 
      }, users.find(u => u.id === userId)?.name || 'Usuário');
    }
    setIsAssigning(false);
  };

  const handleUnassignUser = (userId: string) => {
    if (onUnassignUser) {
      onUnassignUser(task.id, userId);
    }
  };

  const handleToggleWatcher = () => {
    if (!currentUser) return;

    const newWatchers = isWatching
      ? (task.watchers || []).filter(id => id !== currentUser.id)
      : [...(task.watchers || []), currentUser.id];

    if (onUpdateWatchers) {
      onUpdateWatchers(task.id, newWatchers);
    }
    setIsWatching(!isWatching);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (onTaskUpdate && canEdit) {
      onTaskUpdate(task.id, { status: newStatus });
      logTaskUpdated({
        taskId: task.id,
        taskTitle: task.title,
        projectId: projectId,
        projectTitle: 'Projeto' 
      });
    }
  };

  const handleAddUpdate = () => {
    if (!newUpdate.trim()) return;

    setNewUpdate('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho da Colaboração */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Colaboração da Tarefa
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isWatching ? "default" : "outline"}
                size="sm"
                onClick={handleToggleWatcher}
              >
                {isWatching ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {isWatching ? "Parar de seguir" : "Seguir"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Tarefa */}
          <div className="flex items-center gap-4">
            <Label>Status:</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!canEdit}>
                  {task.status === 'completed' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                  {task.status === 'active' && <Clock className="h-4 w-4 mr-2 text-blue-600" />}
                  {task.status === 'pending' && <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />}
                  {task.status === 'completed' ? 'Concluída' :
                    task.status === 'active' ? 'Em Andamento' : 'Pendente'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                  Pendente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Concluída
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Membros Atribuídos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Membros Atribuídos ({assignedUsers.length})</Label>
              {canAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssigning(!isAssigning)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Atribuir
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  {canAssign && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleUnassignUser(user.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Lista de usuários para atribuir */}
            {isAssigning && canAssign && (
              <Card className="p-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selecionar usuários para atribuir:</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium">{user.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignUser(user.id)}
                        >
                          Atribuir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Observadores */}
          <div className="space-y-2">
            <Label>Observadores ({watchers.length})</Label>
            <div className="flex flex-wrap gap-2">
              {watchers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                  <Eye className="h-3 w-3 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Atualizações Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Adicionar Atualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              placeholder="Compartilhe uma atualização sobre esta tarefa..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
            />
            <Button
              onClick={handleAddUpdate}
              disabled={!newUpdate.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Compartilhar Atualização
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Comentários */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comentários ({task.comments?.length || 0})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        {showComments && (
          <CardContent>
            {/* @ts-ignore */}
            <CommentSection
              projectId={projectId}
              taskId={task.id}
            />
          </CardContent>
        )}
      </Card>

      {/* Atividades Recentes */}
      {task.activities && task.activities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {task.activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
