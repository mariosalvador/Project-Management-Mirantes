

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
      {
        id: "1",
        title: "Análise de requisitos",
        description: "Levantamento completo dos requisitos funcionais e não funcionais",
        status: "completed",
        priority: "high",
        assignees: ["Ana Silva"],
        dueDate: "05 Jun 2025",
        startDate: "01 Jun 2025",
        estimatedHours: 16,
        actualHours: 14,
        tags: ["análise", "documentação"]
      },
      {
        id: "2",
        title: "Criação do wireframe",
        description: "Desenvolvimento dos wireframes das principais telas",
        status: "completed",
        priority: "high",
        assignees: ["Carlos Santos"],
        dueDate: "10 Jun 2025",
        startDate: "06 Jun 2025",
        estimatedHours: 24,
        actualHours: 20,
        tags: ["design", "wireframe"],
        dependencies: ["1"]
      },
      {
        id: "3",
        title: "Design das páginas principais",
        description: "Criação do design visual das páginas home, sobre e contato",
        status: "active",
        priority: "high",
        assignees: ["Carlos Santos", "Maria Oliveira"],
        dueDate: "20 Jun 2025",
        startDate: "11 Jun 2025",
        estimatedHours: 40,
        actualHours: 25,
        tags: ["design", "ui"],
        dependencies: ["2"]
      },
      {
        id: "4",
        title: "Desenvolvimento frontend",
        description: "Implementação do frontend responsivo em React/Next.js",
        status: "active",
        priority: "medium",
        assignees: ["Maria Oliveira"],
        dueDate: "30 Jun 2025",
        startDate: "21 Jun 2025",
        estimatedHours: 60,
        actualHours: 30,
        tags: ["frontend", "react"],
        dependencies: ["3"]
      },
      {
        id: "5",
        title: "Integração backend",
        description: "Desenvolvimento da API e integração com banco de dados",
        status: "pending",
        priority: "high",
        assignees: ["João Costa"],
        dueDate: "10 Jul 2025",
        startDate: "01 Jul 2025",
        estimatedHours: 50,
        tags: ["backend", "api"],
        dependencies: ["4"]
      },
      {
        id: "6",
        title: "Testes finais",
        description: "Testes de qualidade, performance e usabilidade",
        status: "pending",
        priority: "medium",
        assignees: ["Petra Lima", "Ana Silva"],
        dueDate: "15 Jul 2025",
        estimatedHours: 30,
        tags: ["testes", "qa"],
        dependencies: ["5"]
      }
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
      {
        id: "7",
        title: "Levantamento de requisitos",
        description: "Análise detalhada dos requisitos do aplicativo mobile",
        status: "completed",
        priority: "high",
        assignees: ["Pedro Almeida"],
        dueDate: "20 Jul 2025",
        startDate: "15 Jul 2025",
        estimatedHours: 20,
        actualHours: 18,
        tags: ["requisitos", "móvel"]
      },
      {
        id: "8",
        title: "Prototipação",
        description: "Criação de protótipos navegáveis para iOS e Android",
        status: "active",
        priority: "high",
        assignees: ["Luisa Fernandes"],
        dueDate: "10 Ago 2025",
        startDate: "21 Jul 2025",
        estimatedHours: 40,
        actualHours: 25,
        tags: ["protótipo", "ux"],
        dependencies: ["7"]
      },
      {
        id: "9",
        title: "Desenvolvimento iOS",
        description: "Desenvolvimento nativo da aplicação para iOS",
        status: "pending",
        priority: "high",
        assignees: ["Luisa Fernandes", "Ricardo Sousa"],
        dueDate: "25 Ago 2025",
        estimatedHours: 80,
        tags: ["ios", "swift"],
        dependencies: ["8"]
      }
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
      {
        id: "10",
        title: "Análise de requisitos",
        description: "Levantamento dos requisitos para o sistema CRM",
        status: "completed",
        priority: "high",
        assignees: ["Sofia Rodrigues"],
        dueDate: "10 Mar 2025",
        startDate: "01 Mar 2025",
        estimatedHours: 24,
        actualHours: 22,
        tags: ["crm", "análise"]
      },
      {
        id: "11",
        title: "Desenvolvimento da API",
        description: "Criação da API REST para o sistema CRM",
        status: "completed",
        priority: "high",
        assignees: ["Miguel Santos"],
        dueDate: "20 Abr 2025",
        startDate: "11 Mar 2025",
        estimatedHours: 60,
        actualHours: 58,
        tags: ["api", "backend"],
        dependencies: ["10"]
      },
      {
        id: "12",
        title: "Interface do usuário",
        description: "Desenvolvimento da interface web do CRM",
        status: "completed",
        priority: "medium",
        assignees: ["Laura Costa"],
        dueDate: "01 Jun 2025",
        startDate: "21 Abr 2025",
        estimatedHours: 50,
        actualHours: 48,
        tags: ["frontend", "ui"],
        dependencies: ["11"]
      }
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
      {
        id: "13",
        title: "Pesquisa de usuário",
        description: "Pesquisa de campo com usuários potenciais da plataforma",
        status: "completed",
        priority: "high",
        assignees: ["Fernanda Alves"],
        dueDate: "15 Mai 2025",
        startDate: "01 Mai 2025",
        estimatedHours: 30,
        actualHours: 28,
        tags: ["pesquisa", "ux"]
      },
      {
        id: "14",
        title: "Arquitetura do sistema",
        description: "Definição da arquitetura técnica da plataforma EAD",
        status: "active",
        priority: "high",
        assignees: ["Paulo Silva"],
        dueDate: "30 Jul 2025",
        startDate: "16 Mai 2025",
        estimatedHours: 45,
        actualHours: 20,
        tags: ["arquitetura", "sistema"],
        dependencies: ["13"]
      },
      {
        id: "15",
        title: "Módulo de videoaulas",
        description: "Desenvolvimento do sistema de upload e reprodução de vídeos",
        status: "pending",
        priority: "medium",
        assignees: ["Paulo Silva", "Roberto Lima"],
        dueDate: "15 Set 2025",
        estimatedHours: 70,
        tags: ["vídeo", "streaming"],
        dependencies: ["14"]
      }
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
