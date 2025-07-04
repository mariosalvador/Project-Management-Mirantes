

import { Project } from "@/types/project";

// Mock data para exemplo
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Redesign completo do site da empresa com nova identidade visual",
    status: "active",
    progress: 65,
    dueDate: "15 Jul 2025",
    teamMembers: 5,
    tasksCompleted: 12,
    totalTasks: 18,
    startDate: "01 Jun 2025",
    budget: "R$ 50.000",
    priority: "high",
    category: "Design",
    manager: "Ana Silva",
    team: [
      { id: "1", name: "Ana Silva", role: "Project Manager", avatar: "AS" },
      { id: "2", name: "Carlos Santos", role: "UI/UX Designer", avatar: "CS" },
      { id: "3", name: "Maria Oliveira", role: "Frontend Developer", avatar: "MO" },
      { id: "4", name: "João Costa", role: "Backend Developer", avatar: "JC" },
      { id: "5", name: "Petra Lima", role: "QA Tester", avatar: "PL" }
    ],
    tasks: [
      { id: "1", title: "Análise de requisitos", status: "completed", assignee: "Ana Silva", dueDate: "05 Jun 2025" },
      { id: "2", title: "Criação do wireframe", status: "completed", assignee: "Carlos Santos", dueDate: "10 Jun 2025" },
      { id: "3", title: "Design das páginas principais", status: "active", assignee: "Carlos Santos", dueDate: "20 Jun 2025" },
      { id: "4", title: "Desenvolvimento frontend", status: "active", assignee: "Maria Oliveira", dueDate: "30 Jun 2025" },
      { id: "5", title: "Integração backend", status: "pending", assignee: "João Costa", dueDate: "10 Jul 2025" },
      { id: "6", title: "Testes finais", status: "pending", assignee: "Petra Lima", dueDate: "15 Jul 2025" }
    ],
    milestones: [
      { id: "1", title: "Aprovação do Design", date: "20 Jun 2025", status: "pending" },
      { id: "2", title: "Desenvolvimento Concluído", date: "05 Jul 2025", status: "pending" },
      { id: "3", title: "Testes Finalizados", date: "15 Jul 2025", status: "pending" }
    ]
  },
  {
    id: "2",
    title: "App Mobile",
    description: "Desenvolvimento do aplicativo mobile para iOS e Android",
    status: "planning",
    progress: 25,
    dueDate: "30 Ago 2025",
    teamMembers: 8,
    tasksCompleted: 3,
    totalTasks: 24,
    startDate: "15 Jul 2025",
    budget: "R$ 120.000",
    priority: "high",
    category: "Mobile",
    manager: "Pedro Almeida",
    team: [
      { id: "6", name: "Pedro Almeida", role: "Project Manager", avatar: "PA" },
      { id: "7", name: "Luisa Fernandes", role: "Mobile Developer", avatar: "LF" },
      { id: "8", name: "Ricardo Sousa", role: "Backend Developer", avatar: "RS" }
    ],
    tasks: [
      { id: "7", title: "Levantamento de requisitos", status: "completed", assignee: "Pedro Almeida", dueDate: "20 Jul 2025" },
      { id: "8", title: "Prototipação", status: "active", assignee: "Luisa Fernandes", dueDate: "10 Ago 2025" },
      { id: "9", title: "Desenvolvimento iOS", status: "pending", assignee: "Luisa Fernandes", dueDate: "25 Ago 2025" }
    ],
    milestones: [
      { id: "4", title: "Protótipo Aprovado", date: "10 Ago 2025", status: "pending" },
      { id: "5", title: "Beta Release", date: "25 Ago 2025", status: "pending" }
    ]
  },
  {
    id: "3",
    title: "Sistema CRM",
    description: "Implementação do novo sistema de gerenciamento de clientes",
    status: "completed",
    progress: 100,
    dueDate: "01 Jun 2025",
    teamMembers: 6,
    tasksCompleted: 15,
    totalTasks: 15,
    startDate: "01 Mar 2025",
    budget: "R$ 80.000",
    priority: "medium",
    category: "Sistema",
    manager: "Sofia Rodrigues",
    team: [
      { id: "9", name: "Sofia Rodrigues", role: "Project Manager", avatar: "SR" },
      { id: "10", name: "Miguel Santos", role: "Backend Developer", avatar: "MS" },
      { id: "11", name: "Laura Costa", role: "Frontend Developer", avatar: "LC" }
    ],
    tasks: [
      { id: "10", title: "Análise de requisitos", status: "completed", assignee: "Sofia Rodrigues", dueDate: "10 Mar 2025" },
      { id: "11", title: "Desenvolvimento da API", status: "completed", assignee: "Miguel Santos", dueDate: "20 Abr 2025" },
      { id: "12", title: "Interface do usuário", status: "completed", assignee: "Laura Costa", dueDate: "01 Jun 2025" }
    ],
    milestones: [
      { id: "6", title: "API Finalizada", date: "20 Abr 2025", status: "completed" },
      { id: "7", title: "Sistema Entregue", date: "01 Jun 2025", status: "completed" }
    ]
  },
  {
    id: "4",
    title: "Plataforma EAD",
    description: "Desenvolvimento de uma plataforma de ensino a distância",
    status: "on-hold",
    progress: 40,
    dueDate: "20 Set 2025",
    teamMembers: 4,
    tasksCompleted: 8,
    totalTasks: 20,
    startDate: "01 Mai 2025",
    budget: "R$ 200.000",
    priority: "low",
    category: "Educação",
    manager: "Roberto Lima",
    team: [
      { id: "12", name: "Roberto Lima", role: "Project Manager", avatar: "RL" },
      { id: "13", name: "Fernanda Alves", role: "UX Designer", avatar: "FA" },
      { id: "14", name: "Paulo Silva", role: "Full Stack Developer", avatar: "PS" }
    ],
    tasks: [
      { id: "13", title: "Pesquisa de usuário", status: "completed", assignee: "Fernanda Alves", dueDate: "15 Mai 2025" },
      { id: "14", title: "Arquitetura do sistema", status: "active", assignee: "Paulo Silva", dueDate: "30 Jul 2025" },
      { id: "15", title: "Módulo de videoaulas", status: "pending", assignee: "Paulo Silva", dueDate: "15 Set 2025" }
    ],
    milestones: [
      { id: "8", title: "Protótipo Inicial", date: "30 Jul 2025", status: "pending" },
      { id: "9", title: "Beta Testing", date: "15 Set 2025", status: "pending" }
    ]
  },
  {
    id: "5",
    title: "Website Redesign",
    description: "Redesign completo do site da empresa com nova identidade visual",
    status: "active",
    progress: 65,
    dueDate: "15 Jul 2025",
    teamMembers: 5,
    tasksCompleted: 12,
    totalTasks: 18
  }
]
