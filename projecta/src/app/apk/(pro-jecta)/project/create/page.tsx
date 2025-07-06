"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { Project, TeamMember, Task, Milestone } from "@/types/project";
import { getPriorityColor, getStatusColor } from "@/utils/tasksFormatters";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { useProjects } from "@/hooks/useProjects";
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

export default function CreateProjectPage() {
  const router = useRouter();
  const { createNewProject, loading } = useProjects();

  // Hook para logging de atividades
  const { logProjectCreated } = useActivityLogger();

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

  // Função para validação em tempo real de datas
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

      // Verificar se a data de entrega não é no passado
      if (formData.dueDate < todayStr) {
        newErrors.dueDate = "Data de entrega não pode ser no passado";
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

      // Verificar se a data de início não é muito antiga (6 meses atrás)
      const minStartDate = new Date();
      minStartDate.setMonth(minStartDate.getMonth() - 6);
      if (startDate < minStartDate) {
        newErrors.startDate = "Data de início não pode ser anterior a 6 meses atrás";
      }

      // Verificar se a data de início não é muito distante no futuro (2 anos)
      const maxStartDate = new Date();
      maxStartDate.setFullYear(maxStartDate.getFullYear() + 2);
      if (startDate > maxStartDate) {
        newErrors.startDate = "Data de início não pode ser superior a 2 anos";
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

      // Projeto não pode durar mais de 3 anos
      if (diffDays > 1095) { // 3 anos = 1095 dias
        newErrors.dueDate = "Duração do projeto não pode exceder 3 anos";
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

    // Validação de orçamento (se fornecido)
    if (formData.budget.trim()) {
      const budgetNum = parseFloat(formData.budget.replace(/[^\d.]/g, ''));
      if (isNaN(budgetNum) || budgetNum < 0) {
        newErrors.budget = "Orçamento deve ser um valor numérico válido";
      } else if (budgetNum > 999999999) {
        newErrors.budget = "Orçamento não pode exceder 999.999.999";
      }
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

    if (!validateForm()) {
      return;
    }

    try {
      // Criar projeto no Firebase
      const projectId = await createNewProject(formData);

      if (projectId) {
        // Registrar atividade no feed
        logProjectCreated({
          projectId: projectId,
          projectTitle: formData.title
        });
        router.push("/apk/project");
      }
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    }
  };

  return (
    <div className="container h-full ">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Projetos", href: "/apk/project" },
            { label: "Novo Projeto" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/apk/project">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Criar Novo Projeto</h1>
            <p className="text-muted-foreground">Defina os detalhes do seu novo projeto</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/apk/project")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Criando..." : "Criar Projeto"}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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

                  <div className="md:col-span-2">
                    <Label htmlFor="budget">Orçamento (Opcional)</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="Ex: 50000, R$ 100.000"
                      className={errors.budget ? "border-red-500" : ""}
                    />
                    {errors.budget && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.budget}
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

            {/* Tarefas Iniciais */}
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

                {/* Avisos de validação em tempo real */}
                {(warnings.duration || warnings.startSoon) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div className="ml-2">
                        <h4 className="text-sm font-medium text-yellow-800">Avisos:</h4>
                        <div className="mt-1 text-sm text-yellow-700">
                          {warnings.duration && <p>• {warnings.duration}</p>}
                          {warnings.startSoon && <p>• {warnings.startSoon}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membros da equipe:</span>
                  <span className="font-medium">{formData.team.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarefas definidas:</span>
                  <span className="font-medium">{formData.tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marcos definidos:</span>
                  <span className="font-medium">{formData.milestones.length}</span>
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

                {/* Indicador de status de validação */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {Object.keys(errors).length === 0 ? (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-xs">Pronto para criar</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 text-xs">{Object.keys(errors).length} erro(s) encontrado(s)</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dicas para criação do projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Dicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>• Defina datas realistas considerando complexidade e recursos</p>
                <p>• Adicione marcos importantes para acompanhar o progresso</p>
                <p>• Inclua todos os membros necessários desde o início</p>
                <p>• Use uma descrição clara e objetiva do projeto</p>
                {formData.startDate && formData.dueDate && (
                  <p className="text-blue-600">
                    • Duração planejada: {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
