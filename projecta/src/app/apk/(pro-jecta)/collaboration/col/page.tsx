"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageCircle,
  Activity,
  Bell,
  Settings,
  CheckCircle,
  Target
} from 'lucide-react';
import { ResponsiveContainer, PageSection } from '@/components/ui/responsive-container';

export default function CollaborationDemoPage() {
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <PageSection
          title="Sistema de Colaboração Implementado"
          description="Recursos de colaboração para membros do projeto: comentários, atribuições e atualizações"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          }
        />

        {/* Resumo dos Recursos Implementados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Gestão de Membros</h3>
                  <p className="text-sm text-muted-foreground">Adicionar e gerenciar membros do projeto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Atribuição de Tarefas</h3>
                  <p className="text-sm text-muted-foreground">Atribuir tarefas aos membros da equipe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Sistema de Comentários</h3>
                  <p className="text-sm text-muted-foreground">Comentários em projetos e tarefas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold">Feed de Atividades</h3>
                  <p className="text-sm text-muted-foreground">Histórico de todas as atividades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Componentes Implementados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Recursos de Colaboração Implementados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Gestão de Permissões</h4>
                  <p className="text-sm text-muted-foreground">Sistema de roles e permissões para diferentes tipos de usuários</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Atribuição de Tarefas</h4>
                  <p className="text-sm text-muted-foreground">Membros podem atribuir tarefas uns aos outros</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Sistema de Comentários</h4>
                  <p className="text-sm text-muted-foreground">Comentários em projetos e tarefas com suporte a menções</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Atualizações Colaborativas</h4>
                  <p className="text-sm text-muted-foreground">Membros podem compartilhar atualizações sobre o progresso</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Notificações Inteligentes</h4>
                  <p className="text-sm text-muted-foreground">Sistema de notificações para manter todos informados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📁 Componentes Criados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">TaskCollaboration</h4>
                <p className="text-sm text-muted-foreground">Componente para colaboração em tarefas específicas</p>
                <code className="text-xs bg-muted p-1 rounded">src/components/projecta/Collaboration/task-collaboration.tsx</code>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">ProjectCollaboration</h4>
                <p className="text-sm text-muted-foreground">Componente para colaboração em nível de projeto</p>
                <code className="text-xs bg-muted p-1 rounded">src/components/projecta/Collaboration/project-collaboration.tsx</code>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">useTaskCollaboration</h4>
                <p className="text-sm text-muted-foreground">Hook para gerenciar colaboração em tarefas</p>
                <code className="text-xs bg-muted p-1 rounded">src/hooks/useTaskCollaboration.ts</code>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">Sistema de Notificações</h4>
                <p className="text-sm text-muted-foreground">Sistema aprimorado com notificações de colaboração</p>
                <code className="text-xs bg-muted p-1 rounded">src/hooks/useNotifications.ts</code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades em Detalhes */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Funcionalidades Implementadas em Detalhes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Colaboração de Membros
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Adicionar e remover membros do projeto
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Definir roles e permissões para cada membro
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Visualizar informações dos membros da equipe
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Sistema de convites para novos membros
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Atribuição de Tarefas
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Atribuir tarefas a múltiplos membros
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Remoção de atribuições quando necessário
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Notificações automáticas para usuários atribuídos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Visualização clara dos responsáveis por cada tarefa
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Sistema de Comentários
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Comentários em projetos e tarefas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Sistema de menções (@usuario)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Edição e exclusão de comentários próprios
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Histórico completo de conversas
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações Inteligentes
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Notificações de atribuição de tarefas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Alertas de mudanças de status
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Notificações de menções em comentários
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Sistema de observadores para tarefas
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status da Implementação */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              ✅ Implementação Concluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300">
              <strong>Todos os recursos de colaboração foram implementados com sucesso!</strong>
            </p>
            <p className="text-green-600 dark:text-green-400 mt-2">
              O sistema agora permite que os membros do projeto colaborem efetivamente através de:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Colaboração em Tempo Real</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Comentários, atualizações e notificações instantâneas
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Gestão de Permissões</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Controle detalhado sobre quem pode fazer o quê
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Atribuição Flexível</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tarefas podem ser atribuídas a múltiplos membros
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Histórico Completo</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Todas as atividades são registradas e podem ser consultadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
}
