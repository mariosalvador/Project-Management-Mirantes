"use client"

import React from 'react';
import { Task } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  Clock,
  Play,
  MoreVertical,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
  canEdit: boolean;
  members: Array<{ id: string; name: string; avatar?: string }>;
  isSelected?: boolean;
  onClick?: () => void;
}

const getStatusInfo = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Concluída',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
      };
    case 'active':
      return {
        label: 'Em Andamento',
        icon: Play,
        color: 'bg-blue-100 text-blue-800',
        iconColor: 'text-blue-600'
      };
    case 'pending':
      return {
        label: 'Pendente',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
        iconColor: 'text-yellow-600'
      };
    default:
      return {
        label: 'Desconhecido',
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800',
        iconColor: 'text-gray-600'
      };
  }
};

const getPriorityColor = (priority?: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function TaskCard({
  task,
  onStatusChange,
  canEdit,
  members,
  isSelected,
  onClick
}: TaskCardProps) {
  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;

  const assignedMembers = task.assignees
    .map(id => members.find(m => m.id === id))
    .filter(Boolean);

  const isOverdue = task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'completed';

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${isOverdue ? 'border-red-200' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium mb-2 flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${statusInfo.iconColor}`} />
              {task.title}
              {isOverdue && (<AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>

              {task.priority && (
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority === 'high' ? 'Alta' :
                    task.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              )}
            </div>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleStatusChange('pending')}
                  disabled={task.status === 'pending'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Marcar como Pendente
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange('active')}
                  disabled={task.status === 'active'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Marcar como Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange('completed')}
                  disabled={task.status === 'completed'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Concluída
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-2">
          {/* Data de entrega */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}

          {/* Membros atribuídos */}
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                {assignedMembers.slice(0, 3).map((member) => (
                  <div
                    key={member?.id}
                    className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium"
                    title={member?.name}
                  >
                    {member?.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {assignedMembers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                    +{assignedMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
