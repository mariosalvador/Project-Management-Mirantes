"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Users,
  Clock,
  Save,
  AlertCircle,
  Target,
  Tag,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { TeamMember, Task } from "@/types/project";
import { useProjectByTitle } from "@/hooks/useProjects";
import { updateProject } from "@/Api/services/projects";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "@/utils/tasksFormatters";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { toast } from "sonner";

interface TaskFormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  assignees: string[];
  dueDate: string;
  startDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  dependencies: string[];
}

export default function TaskManagePage() {
  const router = useRouter();
  const { name } = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const decodedName = decodeURIComponent(name);
  const { project, loading, error, refreshProject } = useProjectByTitle(decodedName);
  const isEditing = !!taskId;
  const existingTask = project?.tasks?.find((t: Task) => t.id === taskId);

  const { logTaskCreated, logTaskUpdated } = useActivityLogger();

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignees: [],
    dueDate: "",
    startDate: "",
    estimatedHours: 0,
    actualHours: 0,
    tags: [],
    dependencies: []
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da tarefa existente se estiver editando
  useEffect(() => {
    if (isEditing && existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || "",
        status: existingTask.status,
        priority: existingTask.priority || "medium",
        assignees: existingTask.assignees || [],
        dueDate: existingTask.dueDate,
        startDate: existingTask.startDate || "",
        estimatedHours: existingTask.estimatedHours || 0,
        actualHours: existingTask.actualHours || 0,
        tags: existingTask.tags || [],
        dependencies: existingTask.dependencies || []
      });
    }
  }, [isEditing, existingTask]);

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
        <h2 className="text-xl font-semibold mb-2">Carregando projeto...</h2>
        <p className="text-muted-foreground">
          Buscando informações do projeto &quot;{decodedName}&quot;
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar projeto</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={refreshProject}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Link href="/apk/project">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Data de entrega é obrigatória";
    }
    if (formData.assignees.length === 0) {
      newErrors.assignees = "Pelo menos um membro deve ser atribuído";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !project) {
      return;
    }

    try {
      const taskData: Task = {
        id: isEditing ? taskId! : Date.now().toString(),
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignees: formData.assignees,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        estimatedHours: formData.estimatedHours,
        actualHours: formData.actualHours,
        tags: formData.tags,
        dependencies: formData.dependencies
      };

      const updatedTasks = isEditing
        ? (project.tasks || []).map(task => task.id === taskId ? taskData : task)
        : [...(project.tasks || []), taskData];

      await updateProject(project.id, { tasks: updatedTasks });

      if (isEditing) {
        logTaskUpdated({
          taskId: taskData.id,
          taskTitle: taskData.title,
          projectId: project.id,
          projectTitle: project.title
        });
      } else {
        logTaskCreated({
          taskId: taskData.id,
          taskTitle: taskData.title,
          projectId: project.id,
          projectTitle: project.title
        });
      }

      toast.success(isEditing ? "Tarefa atualizada com sucesso!" : "Tarefa criada com sucesso!");
      router.push(`/apk/project/${encodeURIComponent(project.title)}/tasks`);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast.error("Erro ao salvar tarefa");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleMemberAssignment = (memberName: string) => {
    const isAssigned = formData.assignees.includes(memberName);

    if (isAssigned) {
      setFormData(prev => ({
        ...prev,
        assignees: prev.assignees.filter(a => a !== memberName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, memberName]
      }));
    }
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Projetos", href: "/apk/project" },
            { label: project.title, href: `/apk/project/${encodeURIComponent(project.title)}` },
            { label: isEditing ? "Editar Tarefa" : "Nova Tarefa" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/apk/project/${encodeURIComponent(project.title)}/tasks`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? `Modificar tarefa do projeto ${project.title}` : `Criar nova tarefa para ${project.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/apk/project/${encodeURIComponent(project.title)}`)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Salvar Alterações" : "Criar Tarefa"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Informações da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Tarefa *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título da tarefa"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os detalhes da tarefa"
                    className="w-full px-3 py-2 border rounded-md min-h-[100px] border-input"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Data de Entrega *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className={errors.dueDate ? "border-red-500" : ""}
                    />
                    {errors.dueDate && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membros Atribuídos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membros Atribuídos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.assignees && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.assignees}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.team && project.team.length > 0 ? (
                    project.team.map((member: TeamMember) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.assignees.includes(member.name)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                          }`}
                        onClick={() => toggleMemberAssignment(member.name)}
                      >
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                          {member.avatar}
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                        {formData.assignees.includes(member.name) && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum membro na equipe ainda</p>
                    </div>
                  )}
                </div>

                {formData.assignees.length > 0 && (
                  <div className="pt-4 border-t">
                    <Label>Membros Selecionados:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.assignees.map((assignee) => (
                        <Badge key={assignee} variant="secondary" className="flex items-center gap-1">
                          {assignee}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => toggleMemberAssignment(assignee)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags e Categorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="pending">Pendente</option>
                    <option value="active">Em Progresso</option>
                    <option value="completed">Concluída</option>
                  </select>
                  <div className="mt-2">
                    <Badge className={getStatusColor(formData.status)}>
                      {getStatusLabel(formData.status)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                  <div className="mt-2">
                    <Badge className={getPriorityColor(formData.priority || 'medium')}>
                      {getPriorityLabel(formData.priority || 'medium')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membros atribuídos:</span>
                  <span className="font-medium">{formData.assignees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tags:</span>
                  <span className="font-medium">{formData.tags.length}</span>
                </div>
                {formData.estimatedHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progresso tempo:</span>
                    <span className="font-medium">
                      {Math.round((formData.actualHours / formData.estimatedHours) * 100)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview da Tarefa */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium truncate">{formData.title || "Título da tarefa"}</h4>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(formData.status)}>
                    {getStatusLabel(formData.status)}
                  </Badge>
                  <Badge className={getPriorityColor(formData.priority || 'medium')}>
                    {getPriorityLabel(formData.priority || 'medium')}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formData.dueDate || "Sem data"}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{formData.assignees.length} membros</span>
                </div>

                {formData.estimatedHours > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formData.estimatedHours}h estimadas</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
