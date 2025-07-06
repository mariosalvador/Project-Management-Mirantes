"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Briefcase,
  Trash2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Project, TeamMember, Task, Milestone } from "@/types/project";
import { useProjectByTitle } from "@/hooks/useProjects";
import { updateProject, deleteProject } from "@/Api/services/projects";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { getPriorityColor, getStatusColor } from "@/utils/tasksFormatters";
import { toast } from "sonner";
import ProjectTeamSelector from "@/components/projecta/project/ProjectTeamSelector";
import ProjectTasksManager from "@/components/projecta/project/ProjectTasksManager";
import ProjectMilestonesManager from "@/components/projecta/project/ProjectMilestonesManager";

interface ProjectFormData {
  title: string;
  description: string;
  status: Project['status'];
  priority: Project['priority'];
  category: string;
  manager: string;
  startDate: string;
  dueDate: string;
  budget: string;
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
}

export default function EditProjectPage() {
  const router = useRouter();
  const { name } = useParams<{ name: string }>();

  const decodedName = decodeURIComponent(name);
  const { project, loading, error, refreshProject } = useProjectByTitle(decodedName);

  // Hook para logging de atividades
  const { logProjectUpdated } = useActivityLogger();

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    status: "planning",
    priority: "medium",
    category: "",
    manager: "",
    startDate: "",
    dueDate: "",
    budget: "",
    team: [],
    tasks: [],
    milestones: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Carregar dados do projeto
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        status: project.status,
        priority: project.priority || "medium",
        category: project.category || "",
        manager: project.manager || "",
        startDate: project.startDate || "",
        dueDate: project.dueDate || "",
        budget: project.budget || "",
        team: project.team || [],
        tasks: project.tasks || [],
        milestones: project.milestones || []
      });
    }
  }, [project]);

  // Função para limpar erros específicos quando o usuário corrige um campo
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateDatesRealTime = (startDate: string, dueDate: string) => {
    const newWarnings: Record<string, string> = {};

    if (startDate && dueDate) {
      const start = new Date(startDate);
      const end = new Date(dueDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Avisos para durações muito curtas ou muito longas
      if (diffDays < 7) {
        newWarnings.duration = "Projeto com duração muito curta (menos de 1 semana)";
      } else if (diffDays > 365) {
        newWarnings.duration = "Projeto com duração muito longa (mais de 1 ano)";
      }

      // Aviso se o projeto começar muito em breve
      const today = new Date();
      const timeTillStart = start.getTime() - today.getTime();
      const daysTillStart = Math.ceil(timeTillStart / (1000 * 60 * 60 * 24));

      if (daysTillStart < 2 && daysTillStart >= 0) {
        newWarnings.startSoon = "Projeto iniciará em breve. Certifique-se de que a equipe está preparada";
      }
    }

    setWarnings(newWarnings);
  };

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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Validações básicas
    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Título deve ter pelo menos 3 caracteres";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Título deve ter no máximo 100 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres";
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = "Descrição deve ter no máximo 1000 caracteres";
    }

    if (!formData.manager.trim()) {
      newErrors.manager = "Gerente do projeto é obrigatório";
    } else if (formData.manager.trim().length < 2) {
      newErrors.manager = "Nome do gerente deve ter pelo menos 2 caracteres";
    }

    // Validações de datas
    if (!formData.dueDate) {
      newErrors.dueDate = "Data de entrega é obrigatória";
    } else {
      const dueDate = new Date(formData.dueDate);

      // Para projetos em edição, permitir datas passadas se o projeto já está concluído
      if (formData.status !== 'completed' && formData.dueDate < todayStr) {
        // Apenas aviso, não erro, para projetos em andamento
        if (formData.status === 'active') {
          // Permitir, mas será mostrado aviso
        } else {
          newErrors.dueDate = "Data de entrega não pode ser no passado para projetos não concluídos";
        }
      }

      // Verificar se a data não é muito distante no futuro (5 anos)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5);
      if (dueDate > maxDate) {
        newErrors.dueDate = "Data de entrega não pode ser superior a 5 anos";
      }
    }

    // Validações da data de início
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);

      // Para edição, ser mais flexível com datas passadas
      const minStartDate = new Date();
      minStartDate.setFullYear(minStartDate.getFullYear() - 2); // 2 anos atrás
      if (startDate < minStartDate) {
        newErrors.startDate = "Data de início muito antiga (mais de 2 anos atrás)";
      }

      // Verificar se a data de início é anterior à data de entrega
      if (formData.dueDate && formData.startDate > formData.dueDate) {
        newErrors.startDate = "Data de início deve ser anterior à data de entrega";
      }

      // Verificar duração mínima do projeto (pelo menos 1 dia)
      if (formData.dueDate && formData.startDate === formData.dueDate) {
        newErrors.dueDate = "O projeto deve ter duração mínima de 1 dia";
      }
    }

    // Validação da duração máxima do projeto
    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.dueDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Projeto não pode durar mais de 5 anos (mais flexível para edição)
      if (diffDays > 1825) { // 5 anos = 1825 dias
        newErrors.dueDate = "Duração do projeto não pode exceder 5 anos";
      }
    }

    // Validações da equipe
    if (formData.team.length === 0) {
      newErrors.team = "Pelo menos um membro da equipe deve ser adicionado";
    }

    // Validação de categoria
    if (formData.category.trim() && formData.category.trim().length > 50) {
      newErrors.category = "Categoria deve ter no máximo 50 caracteres";
    }

    // Validação de marcos
    if (formData.milestones.length > 0) {
      formData.milestones.forEach((milestone, index) => {
        if (formData.startDate && milestone.date < formData.startDate) {
          newErrors[`milestone_${index}`] = `Marco "${milestone.title}" não pode ser anterior à data de início`;
        }

        if (formData.dueDate && milestone.date > formData.dueDate) {
          newErrors[`milestone_${index}`] = `Marco "${milestone.title}" não pode ser posterior à data de entrega`;
        }
      });
    }

    // Validação de tarefas
    if (formData.tasks.length > 0) {
      formData.tasks.forEach((task, index) => {
        if (formData.startDate && task.dueDate < formData.startDate) {
          newErrors[`task_${index}`] = `Tarefa "${task.title}" não pode ter prazo anterior à data de início`;
        }

        if (formData.dueDate && task.dueDate > formData.dueDate) {
          newErrors[`task_${index}`] = `Tarefa "${task.title}" não pode ter prazo posterior à data de entrega`;
        }
      });
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
      // Atualizar projeto no Firestore
      await updateProject(project.id, formData);

      // Registrar atividade no feed
      logProjectUpdated({
        projectId: project.id,
        projectTitle: formData.title
      });

      toast.success("Projeto atualizado com sucesso!");
      router.push(`/apk/project/${encodeURIComponent(formData.title)}`);
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast.error("Erro ao atualizar projeto");
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await deleteProject(project.id);
      toast.success("Projeto removido com sucesso!");
      router.push("/apk/project");
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
      toast.error("Erro ao deletar projeto");
    }
  };

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

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Projetos", href: "/apk/project" },
            { label: project.title, href: `/apk/project/${encodeURIComponent(project.title)}` },
            { label: "Editar" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/apk/project/${project.title}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Projeto</h1>
            <p className="text-muted-foreground">Modifique os detalhes do projeto</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
          <Button variant="outline" onClick={() => router.push(`/apk/project/${project.title}`)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
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
                  <Briefcase className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Título do Projeto *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        clearFieldError('title');
                      }}
                      placeholder="Digite o título do projeto"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        clearFieldError('description');
                      }}
                      placeholder="Descreva os objetivos e escopo do projeto"
                      className={`w-full px-3 py-2 border rounded-md min-h-[100px] ${errors.description ? "border-red-500" : "border-input"}`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, category: e.target.value }));
                        clearFieldError('category');
                      }}
                      placeholder="Ex: Design, Desenvolvimento, Marketing"
                      className={errors.category ? "border-red-500" : ""}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="manager">Gerente do Projeto *</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, manager: e.target.value }));
                        clearFieldError('manager');
                      }}
                      placeholder="Nome do gerente responsável"
                      className={errors.manager ? "border-red-500" : ""}
                    />
                    {errors.manager && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.manager}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipe do Projeto */}
            <ProjectTeamSelector
              selectedMembers={formData.team}
              onMembersChange={(members) => setFormData(prev => ({ ...prev, team: members }))}
            />
            {errors.team && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.team}
                </p>
              </div>
            )}

            {/* Tarefas do Projeto */}
            <ProjectTasksManager
              tasks={formData.tasks}
              onTasksChange={(tasks) => setFormData(prev => ({ ...prev, tasks }))}
              projectStartDate={formData.startDate}
              projectDueDate={formData.dueDate}
              teamMembers={formData.team}
              errors={errors}
            />

            {/* Marcos do Projeto */}
            <ProjectMilestonesManager
              milestones={formData.milestones}
              onMilestonesChange={(milestones) => setFormData(prev => ({ ...prev, milestones }))}
              projectStartDate={formData.startDate}
              projectDueDate={formData.dueDate}
              errors={errors}
            />
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            {/* Configurações do Projeto */}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="planning">Planejamento</option>
                    <option value="active">Ativo</option>
                    <option value="on-hold">Pausado</option>
                    <option value="completed">Concluído</option>
                  </select>
                  <div className="mt-2">
                    <Badge className={getStatusColor(formData.status)}>
                      {formData.status === 'planning' ? 'Planejamento' :
                        formData.status === 'active' ? 'Ativo' :
                          formData.status === 'on-hold' ? 'Pausado' : 'Concluído'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                  <div className="mt-2">
                    <Badge className={getPriorityColor(formData.priority || 'medium')}>
                      {formData.priority === 'low' ? 'Baixa' :
                        formData.priority === 'medium' ? 'Média' : 'Alta'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, startDate: e.target.value }));
                      clearFieldError('startDate');
                      validateDatesRealTime(e.target.value, formData.dueDate);
                    }}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label htmlFor="dueDate">Data de Entrega *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, dueDate: e.target.value }));
                      clearFieldError('dueDate');
                      validateDatesRealTime(formData.startDate, e.target.value);
                    }}
                    className={errors.dueDate ? "border-red-500" : ""}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Avisos em tempo real */}
                {(warnings.duration || warnings.startSoon) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md space-y-1">
                    {warnings.duration && (
                      <p className="text-sm text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {warnings.duration}
                      </p>
                    )}
                    {warnings.startSoon && (
                      <p className="text-sm text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {warnings.startSoon}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membros da equipe:</span>
                  <span className="font-medium">{formData.team.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de tarefas:</span>
                  <span className="font-medium">{formData.tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarefas concluídas:</span>
                  <span className="font-medium">
                    {formData.tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marcos definidos:</span>
                  <span className="font-medium">{formData.milestones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marcos concluídos:</span>
                  <span className="font-medium">
                    {formData.milestones.filter(m => m.status === 'completed').length}
                  </span>
                </div>
                {formData.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orçamento:</span>
                    <span className="font-medium">{formData.budget}</span>
                  </div>
                )}
                {formData.startDate && formData.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Progresso geral:</span>
                  <span>
                    {formData.tasks.length > 0
                      ? Math.round((formData.tasks.filter(t => t.status === 'completed').length / formData.tasks.length) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Dicas para edição do projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Dicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>• Monitore o progresso das tarefas regularmente</p>
                <p>• Ajuste datas conforme necessário durante o projeto</p>
                <p>• Mantenha a equipe atualizada sobre mudanças</p>
                <p>• Use marcos para acompanhar etapas importantes</p>
                {formData.startDate && formData.dueDate && (
                  <p>• Duração atual: {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Modal de Confirmação */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Deletar Projeto"
        description={`Tem certeza que deseja deletar o projeto "${project.title}"? Esta ação não pode ser desfeita e todos os dados do projeto serão perdidos permanentemente.`}
        confirmText="Deletar Projeto"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
