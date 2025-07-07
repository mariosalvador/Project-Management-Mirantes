"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Target, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Task } from "@/types/project";
import { getPriorityColor, getTaskStatusColor } from "@/utils/tasksFormatters";

interface ProjectTasksManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  projectStartDate?: string;
  projectDueDate?: string;
  teamMembers?: Array<{ id: string; name: string; role: string }>;
  errors?: Record<string, string>;
}

export default function ProjectTasksManager({
  tasks,
  onTasksChange,
  projectStartDate,
  projectDueDate,
  teamMembers = [],
  errors = {}
}: ProjectTasksManagerProps) {
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "medium" as Task['priority']
  });

  const addTask = () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        status: "pending",
        assignees: [newTask.assignee],
        dueDate: newTask.dueDate,
        priority: newTask.priority
      };

      onTasksChange([...tasks, task]);
      setNewTask({ title: "", assignee: "", dueDate: "", priority: "medium" });
    }
  };

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(task => task.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    onTasksChange(
      tasks.map(task =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  const updateTaskPriority = (id: string, priority: Task['priority']) => {
    onTasksChange(
      tasks.map(task =>
        task.id === id ? { ...task, priority } : task
      )
    );
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isTaskOverdue = (dueDate: string, status: Task['status']) => {
    if (status === 'completed') return false;
    const today = new Date();
    const taskDue = new Date(dueDate);
    return taskDue < today;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Tarefas do Projeto
          {tasks.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {tasks.filter(t => t.status === 'completed').length}/{tasks.length} concluídas
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para adicionar nova tarefa */}
        <div className="flex flex-col xl:flex-row gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="taskTitle">Título da Tarefa</Label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da tarefa"
            />
          </div>

          <div>
            <Label htmlFor="taskAssignee">Responsável</Label>
            <Select
              value={newTask.assignee}
              onValueChange={(value) => setNewTask(prev => ({ ...prev, assignee: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar responsável" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground">({member.role})</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="other">Outro responsável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taskPriority">Prioridade</Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as Task['priority'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taskDueDate">Data de Entrega</Label>
            <Input
              id="taskDueDate"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              min={projectStartDate}
              max={projectDueDate}
            />
          </div>

        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={addTask}
            className="w-full"
            disabled={!newTask.title || !newTask.assignee || !newTask.dueDate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Lista de tarefas */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={task.id}>
                <div className={`flex items-center justify-between p-4 border rounded-lg ${isTaskOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''
                  }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <div className="font-medium">{task.title}</div>
                      {isTaskOverdue(task.dueDate, task.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasada
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Responsável: {Array.isArray(task.assignees) ? task.assignees.join(', ') : task.assignees} •
                      Entrega: {task.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Prioridade */}
                    <Select
                      value={task.priority || 'medium'}
                      onValueChange={(value) => updateTaskPriority(task.id, value as Task['priority'])}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Badge de prioridade */}
                    <Badge className={getPriorityColor(task.priority || 'medium')}>
                      {task.priority === 'high' ? 'Alta' :
                        task.priority === 'low' ? 'Baixa' : 'Média'}
                    </Badge>

                    {/* Status */}
                    <Select
                      value={task.status}
                      onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="active">Em Progresso</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>

                    <Badge className={getTaskStatusColor(task.status)}>
                      {task.status === 'pending' ? 'Pendente' :
                        task.status === 'active' ? 'Em Progresso' : 'Concluída'}
                    </Badge>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mostrar erros específicos da tarefa */}
                {errors[`task_${index}`] && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`task_${index}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma tarefa definida ainda</p>
            <p className="text-sm">Adicione tarefas para organizar o trabalho do projeto</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
