"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Toast, useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Plus,
  Search,
  Grid3X3,
  List,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause
} from "lucide-react";
import Link from "next/link";
import { mockProjects } from "../../mock";
import { Task, Project, TeamMember } from "@/types/project";
import {
  formatAssignees,
  getPriorityColor,
  getPriorityLabel,
  calculateTaskProgress,
  formatHours,
  getTasksStats,
  getTaskStatusLabel
} from "@/utils/tasksFormatters";
import { useNotifications } from "@/hooks/useNotifications";
import { useTaskDeadlineMonitor } from "@/hooks/useTaskMonitoring";
import { useActivityLogger } from "@/hooks/useActivityLogger";

// Configuração das colunas do Kanban
interface TaskColumn {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const taskColumns: TaskColumn[] = [
  {
    id: 'pending',
    title: 'Pendentes',
    status: 'pending',
    color: 'bg-gray-50 border-gray-200',
    icon: Pause
  },
  {
    id: 'active',
    title: 'Em Progresso',
    status: 'active',
    color: 'bg-blue-50 border-blue-200',
    icon: Play
  },
  {
    id: 'completed',
    title: 'Concluídas',
    status: 'completed',
    color: 'bg-green-50 border-green-200',
    icon: CheckCircle2
  }
];

export default function ProjectTasksPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const project = mockProjects.find((p: Project) => p.title === decodedName);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Sistema de toast
  const { toast, showToast, hideToast } = useToast();

  // Sistema de notificações
  const { notifyTaskStatusChange } = useNotifications();

  // Sistema de atividades
  const { logTaskStatusChanged } = useActivityLogger();

  // Monitor de prazos de tarefas
  useTaskDeadlineMonitor(tasks, project);

  useEffect(() => {
    if (project?.tasks) {
      setTasks(project.tasks);
      setFilteredTasks(project.tasks);
    }
  }, [project]);

  // Filtrar tarefas baseado nos critérios
  useEffect(() => {
    let filtered = tasks;

    // Filtro por busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por prioridade
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Filtro por responsável
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task =>
        task.assignees.includes(filterAssignee)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterPriority, filterAssignee]);

  // Funções para drag and drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');

    if (taskId && taskId !== draggedTask) return;

    handleStatusChange(taskId, newStatus);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // Função para mudar status da tarefa com click
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    );
    setTasks(updatedTasks);

    // Feedback visual com toast
    showToast(`Tarefa "${task.title}" movida para ${getTaskStatusLabel(newStatus)}`, 'success');

    // Criar notificação de mudança de status
    if (project && oldStatus !== newStatus) {
      notifyTaskStatusChange(task, oldStatus, newStatus, project.title);

      // Registrar atividade no feed
      logTaskStatusChanged(
        {
          taskId: task.id,
          taskTitle: task.title,
          projectId: project.id,
          projectTitle: project.title
        },
        oldStatus,
        newStatus
      );
    }
  };

  // Obter tarefas por status
  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Estatísticas das tarefas
  const stats = getTasksStats(tasks);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Projeto não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O projeto &quot;{decodedName}&quot; não foi encontrado.
        </p>
        <Link href="/apk/project">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Projetos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Projetos", href: "/apk/project" },
            { label: project.title, href: `/apk/project/${encodeURIComponent(project.title)}` },
            { label: "Tarefas" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/apk/project/${encodeURIComponent(project.title)}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tarefas do Projeto</h1>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks/manage`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todas Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todos Responsáveis</option>
            {project.team?.map((member: TeamMember) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>

          {/* Toggle de visualização */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {tasks.length === 0 ? (
        /* Estado inicial - Sem tarefas */
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-sm mb-4">Comece criando sua primeira tarefa para este projeto</p>
          <Link href={`/apk/project/${encodeURIComponent(decodedName)}/tasks/manage`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </Link>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Estado de filtro vazio */
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-sm mb-4">Tente ajustar os filtros ou criar uma nova tarefa</p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterPriority('all');
                setFilterAssignee('all');
              }}
            >
              Limpar Filtros
            </Button>
            <Link href={`/apk/project/${encodeURIComponent(decodedName)}/tasks/manage`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'board' ? (
        /* Visualização em Quadro (Kanban) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {taskColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const Icon = column.icon;

            return (
              <div key={column.id} className="space-y-4">
                {/* Header da Coluna */}
                <div className={`p-4 rounded-lg border-2 border-dashed ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold">{column.title}</h3>
                    </div>
                    <Badge variant="secondary">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Drop Zone para Tarefas */}
                <div
                  className={`space-y-3 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-all duration-200 ${draggedTask
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-transparent hover:border-muted-foreground/25'
                    }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-all duration-200 ${draggedTask === task.id
                        ? 'opacity-50 scale-95 rotate-2'
                        : 'opacity-100 scale-100 rotate-0'
                        }`}
                    >
                      <TaskCard
                        task={task}
                        onStatusChange={handleStatusChange}
                        projectTitle={project.title}
                      />
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className={`flex flex-col items-center justify-center h-32 text-muted-foreground transition-all duration-200 ${draggedTask ? 'scale-105 text-primary' : 'scale-100'
                      }`}>
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm font-medium">
                        {draggedTask ? 'Solte a tarefa aqui' : 'Arraste tarefas aqui'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização em Lista */
        <TaskListView
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          projectTitle={project.title}
        />
      )}

      {/* Toast para feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

// Componente para Card de Tarefa
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  projectTitle: string;
}

function TaskCard({ task, onStatusChange, projectTitle }: TaskCardProps) {
  const progress = calculateTaskProgress(task);

  return (
    <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">
              {task.title}
            </h4>
            <Link href={`/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage?taskId=${task.id}`}>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10">
                ✏️ Editar
              </Button>
            </Link>
          </div>

          {/* Descrição */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Prioridade e Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            )}

            {/* Dropdown para mudar status */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
              className="text-xs px-2 py-1 border rounded bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="pending">Pendente</option>
              <option value="active">Em Progresso</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          {/* Progresso */}
          {task.estimatedHours && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {/* Informações adicionais */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>

            {task.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{task.assignees.length}</span>
              </div>
            )}
          </div>

          {/* Responsáveis */}
          {task.assignees.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.assignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={index}
                  className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium"
                  title={assignee}
                >
                  {assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para Visualização em Lista
interface TaskListViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  projectTitle: string;
}

function TaskListView({ tasks, onStatusChange, projectTitle }: TaskListViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tarefas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-sm mb-4">Comece criando sua primeira tarefa para este projeto</p>
              <Link href={`/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </Link>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full transition-colors ${task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    {task.priority && (
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatAssignees(task.assignees)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                    {task.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatHours(task.estimatedHours)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                    className="text-sm px-2 py-1 border rounded transition-colors hover:border-primary"
                  >
                    <option value="pending">Pendente</option>
                    <option value="active">Em Progresso</option>
                    <option value="completed">Concluída</option>
                  </select>

                  <Link href={`/apk/project/${encodeURIComponent(projectTitle)}/tasks/manage?taskId=${task.id}`}>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                      ✏️ Editar
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
