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
  loading?: boolean;
  lastUpdated?: Date;
}

export function CollaborationStats({ stats, loading = false, lastUpdated }: CollaborationStatsProps) {
  const taskCompletionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const projectCompletionRate = stats.totalProjects > 0
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
    : 0;

  const tasksInProgress = stats.activeTasks + stats.pendingTasks;
  const hasOverdueTasks = stats.overdueTasks > 0;

  // Mostrar estado vazio apenas se realmente não houver dados e não estiver carregando
  const shouldShowEmpty = !loading &&
    stats.totalProjects === 0 &&
    stats.totalTasks === 0 &&
    stats.activeTasks === 0 &&
    stats.completedTasks === 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg animate-pulse">
                  <div className="h-6 w-6 bg-gray-300 rounded"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (shouldShowEmpty) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {stats.totalProjects === 0 ? 'Bem-vindo à Colaboração!' : 'Carregando dados...'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {stats.totalProjects === 0
              ? 'Você ainda não está participando de nenhum projeto. Suas estatísticas aparecerão aqui quando você for adicionado a projetos.'
              : 'Aguarde enquanto carregamos suas estatísticas de colaboração...'
            }
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Projetos: {stats.totalProjects}</p>
            <p>Tarefas: {stats.totalTasks}</p>
            {lastUpdated && (
              <p>Última atualização: {lastUpdated.toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                  <span className="text-xs text-muted-foreground">Taxa de Conclusão</span>
                  <span className="text-xs font-medium">{projectCompletionRate}%</span>
                </div>
                <Progress value={projectCompletionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedProjects} concluído{stats.completedProjects !== 1 ? 's' : ''}
                </p>
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
                  <span className="text-xs text-muted-foreground">Taxa de Conclusão</span>
                  <span className="text-xs font-medium">{taskCompletionRate}%</span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {tasksInProgress} em andamento
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarefas em Andamento */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasOverdueTasks ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Clock className={`h-6 w-6 ${hasOverdueTasks ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.activeTasks}</p>
                  {stats.pendingTasks > 0 && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                      +{stats.pendingTasks} pendente{stats.pendingTasks > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {stats.overdueTasks > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    {stats.overdueTasks} atrasada{stats.overdueTasks > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Total: {tasksInProgress} tarefa{tasksInProgress !== 1 ? 's' : ''} ativa{tasksInProgress !== 1 ? 's' : ''}
              </p>
            </div>
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
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.myProgress}%</p>
                  {stats.myProgress >= 80 && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Excelente!
                    </Badge>
                  )}
                  {stats.myProgress >= 50 && stats.myProgress < 80 && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      Bom progresso
                    </Badge>
                  )}
                  {stats.myProgress < 50 && stats.myProgress > 0 && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                      Continue assim
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Progress
                value={stats.myProgress}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Baseado nas suas tarefas atribuídas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações de atualização */}
      {lastUpdated && (
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Estatísticas atualizadas em {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </>
  );
}
