"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';

interface CollaborationStatsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    myProgress: number;
  };
}

export function CollaborationStats({ stats }: CollaborationStatsProps) {
  const taskCompletionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const projectCompletionRate = stats.totalProjects > 0
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Projetos Ativos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                <Badge variant="outline" className="text-xs">
                  {stats.totalProjects} total
                </Badge>
              </div>
            </div>
          </div>
          {stats.totalProjects > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Conclusão</span>
                <span className="text-xs font-medium">{projectCompletionRate}%</span>
              </div>
              <Progress value={projectCompletionRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas Concluídas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <Badge variant="outline" className="text-xs">
                  {stats.totalTasks} total
                </Badge>
              </div>
            </div>
          </div>
          {stats.totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Progresso</span>
                <span className="text-xs font-medium">{taskCompletionRate}%</span>
              </div>
              <Progress value={taskCompletionRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas em Andamento */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.activeTasks}</p>
                {stats.pendingTasks > 0 && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                    +{stats.pendingTasks} pendentes
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {stats.overdueTasks > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">
                {stats.overdueTasks} atrasada{stats.overdueTasks > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meu Progresso */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Meu Progresso</p>
              <p className="text-2xl font-bold">{stats.myProgress}%</p>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={stats.myProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Baseado nas suas tarefas atribuídas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
