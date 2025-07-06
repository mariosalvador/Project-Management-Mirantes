"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, Users, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'projects' | 'tasks' | 'members';
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStates = {
  projects: {
    icon: Target,
    title: 'Nenhum projeto encontrado',
    description: 'Você ainda não está participando de nenhum projeto.',
    actionLabel: 'Criar Projeto'
  },
  tasks: {
    icon: CheckCircle,
    title: 'Nenhuma tarefa atribuída',
    description: 'Você não tem tarefas atribuídas no momento.',
    actionLabel: 'Ver Todos os Projetos'
  },
  members: {
    icon: Users,
    title: 'Nenhum membro na equipe',
    description: 'Este projeto ainda não tem membros adicionados.',
    actionLabel: 'Convidar Membros'
  }
};

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const config = emptyStates[type];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {config.description}
        </p>
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel || config.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
