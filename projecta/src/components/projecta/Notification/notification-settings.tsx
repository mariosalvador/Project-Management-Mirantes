/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  AlertTriangle,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationSettings } from '@/types/notification';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettingsPanel({ className }: NotificationSettingsProps) {
  const { settings, updateSettings } = useNotifications();

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleNestedSettingChange = (
    parentKey: keyof NotificationSettings,
    childKey: string,
    value: any
  ) => {
    const parentValue = settings[parentKey] as any;
    updateSettings({
      [parentKey]: {
        ...parentValue,
        [childKey]: value
      }
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Canais de Notificação</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <Label htmlFor="in-app">Notificações no App</Label>
              </div>
              <Switch
                id="in-app"
                checked={settings.inAppNotifications}
                onCheckedChange={(checked) => handleSettingChange('inAppNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <Label htmlFor="email">Notificações por Email</Label>
              </div>
              <Switch
                id="email"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-500" />
                <Label htmlFor="push">Notificações Push</Label>
              </div>
              <Switch
                id="push"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Configurações de Prazos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Prazos de Tarefas
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-enabled">Avisar sobre prazos</Label>
              <Switch
                id="deadline-enabled"
                checked={settings.taskDeadlines.enabled}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange('taskDeadlines', 'enabled', checked)
                }
              />
            </div>

            {settings.taskDeadlines.enabled && (
              <div className="ml-4 space-y-2">
                <Label htmlFor="days-before" className="text-sm text-muted-foreground">
                  Avisar quantos dias antes do prazo?
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="days-before"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.taskDeadlines.daysBefore}
                    onChange={(e) =>
                      handleNestedSettingChange('taskDeadlines', 'daysBefore', parseInt(e.target.value))
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Configurações de Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              Mudanças de Status
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="status-enabled">Avisar sobre mudanças de status</Label>
              <Switch
                id="status-enabled"
                checked={settings.taskStatusChanges.enabled}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange('taskStatusChanges', 'enabled', checked)
                }
              />
            </div>

            {settings.taskStatusChanges.enabled && (
              <div className="ml-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="only-my-tasks" className="text-sm">
                    Apenas para minhas tarefas
                  </Label>
                  <Switch
                    id="only-my-tasks"
                    checked={settings.taskStatusChanges.onlyMyTasks}
                    onCheckedChange={(checked) =>
                      handleNestedSettingChange('taskStatusChanges', 'onlyMyTasks', checked)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Configurações de Atribuições */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              Atribuições
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="task-assignments">Atribuições de tarefas</Label>
              <Switch
                id="task-assignments"
                checked={settings.taskAssignments.enabled}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange('taskAssignments', 'enabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="project-assignments">Atribuições de projetos</Label>
              <Switch
                id="project-assignments"
                checked={settings.projectAssignments.enabled}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange('projectAssignments', 'enabled', checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Configurações de Tarefas Vencidas */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Tarefas Vencidas
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="overdue-enabled">Lembretes de tarefas vencidas</Label>
              <Switch
                id="overdue-enabled"
                checked={settings.overdueReminders.enabled}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange('overdueReminders', 'enabled', checked)
                }
              />
            </div>

            {settings.overdueReminders.enabled && (
              <div className="ml-4">
                <Label className="text-sm text-muted-foreground">
                  Frequência dos lembretes
                </Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={settings.overdueReminders.frequency === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      handleNestedSettingChange('overdueReminders', 'frequency', 'daily')
                    }
                  >
                    Diário
                  </Button>
                  <Button
                    variant={settings.overdueReminders.frequency === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      handleNestedSettingChange('overdueReminders', 'frequency', 'weekly')
                    }
                  >
                    Semanal
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Resumo das Configurações */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Resumo das Configurações</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                <span className="text-xs">App</span>
                <Badge variant={settings.inAppNotifications ? 'default' : 'secondary'} className="h-4 text-xs">
                  {settings.inAppNotifications ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="text-xs">Email</span>
                <Badge variant={settings.emailNotifications ? 'default' : 'secondary'} className="h-4 text-xs">
                  {settings.emailNotifications ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Prazos</span>
                <Badge variant={settings.taskDeadlines.enabled ? 'default' : 'secondary'} className="h-4 text-xs">
                  {settings.taskDeadlines.enabled ? `${settings.taskDeadlines.daysBefore}d` : 'Off'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">Vencidas</span>
                <Badge variant={settings.overdueReminders.enabled ? 'default' : 'secondary'} className="h-4 text-xs">
                  {settings.overdueReminders.enabled ? settings.overdueReminders.frequency : 'Off'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botão de Reset */}
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Reset para configurações padrão
                updateSettings({
                  emailNotifications: true,
                  pushNotifications: true,
                  inAppNotifications: true,
                  taskDeadlines: { enabled: true, daysBefore: 2 },
                  taskStatusChanges: { enabled: true, onlyMyTasks: false },
                  taskAssignments: { enabled: true },
                  projectAssignments: { enabled: true },
                  overdueReminders: { enabled: true, frequency: 'daily' }
                });
              }}
            >
              Restaurar Configurações Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
