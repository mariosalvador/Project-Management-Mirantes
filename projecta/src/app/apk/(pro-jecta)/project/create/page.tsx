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
import { Avatar } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Users,
  DollarSign,
  Save,
  AlertCircle,
  Briefcase,
  Target,
  Flag
} from "lucide-react";
import Link from "next/link";
import { Project, TeamMember, Task, Milestone } from "@/types/project";
import { getPriorityColor, getStatusColor } from "@/utils/tasksFormatters";

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

  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    avatar: ""
  });

  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: ""
  });

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    date: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }
    if (!formData.manager.trim()) {
      newErrors.manager = "Gerente do projeto é obrigatório";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Data de entrega é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Aqui você salvaria o projeto
    console.log("Salvando projeto:", formData);

    // Simular salvamento e redirecionar
    router.push("/apk/project");
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newTeamMember.name,
        role: newTeamMember.role,
        avatar: newTeamMember.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      setFormData(prev => ({
        ...prev,
        team: [...prev.team, member]
      }));

      setNewTeamMember({ name: "", role: "", avatar: "" });
    }
  };

  const removeTeamMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(member => member.id !== id)
    }));
  };

  const addTask = () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        status: "pending",
        assignee: newTask.assignee,
        dueDate: newTask.dueDate
      };

      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, task]
      }));

      setNewTask({ title: "", assignee: "", dueDate: "" });
    }
  };

  const removeTask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id)
    }));
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.date) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        date: newMilestone.date,
        status: "pending"
      };

      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));

      setNewMilestone({ title: "", date: "" });
    }
  };

  const removeMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }));
  };

  return (
    <div className="container ">
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
          <Button variant="outline" onClick={() => router.push("/apk/project")}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Criar Projeto
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
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="manager">Gerente do Projeto *</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="memberName">Nome do Membro</Label>
                    <Input
                      id="memberName"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberRole">Função</Label>
                    <Input
                      id="memberRole"
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Ex: Developer, Designer"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addTeamMember} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {formData.team.length > 0 && (
                  <div className="space-y-2">
                    {formData.team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            {member.avatar}
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarefas Iniciais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tarefas Iniciais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
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
                    <Input
                      id="taskAssignee"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskDueDate">Data de Entrega</Label>
                    <Input
                      id="taskDueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addTask} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {formData.tasks.length > 0 && (
                  <div className="space-y-2">
                    {formData.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {task.assignee} • {task.dueDate}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTask(task.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marcos do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Marcos do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="milestoneTitle">Título do Marco</Label>
                    <Input
                      id="milestoneTitle"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do marco"
                    />
                  </div>
                  <div>
                    <Label htmlFor="milestoneDate">Data Prevista</Label>
                    <Input
                      id="milestoneDate"
                      type="date"
                      value={newMilestone.date}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addMilestone} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {formData.milestones.length > 0 && (
                  <div className="space-y-2">
                    {formData.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{milestone.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {milestone.date}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(milestone.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <Separator />

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

                <Separator />

                <div>
                  <Label htmlFor="budget">Orçamento</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="R$ 0,00"
                      className="pl-9"
                    />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
