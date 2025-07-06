export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending';
  priority?: 'high' | 'medium' | 'low';
  assignees: string[]; // Array de IDs ou nomes dos membros
  dueDate: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[]; // IDs de outras tarefas
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'planning' | 'on-hold';
  progress?: number;
  dueDate?: string;
  teamMembers?: number;
  tasksCompleted?: number;
  totalTasks?: number;
  startDate?: string;
  budget?: string;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  manager?: string;
  team?: TeamMember[];
  tasks?: Task[];
  milestones?: Milestone[];
  createdBy?: string; // ID do usuário que criou o projeto
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
}

export interface ProjectSample {
  id: string
  title: string
  description: string
  status: "planning" | "active" | "completed" | "on-hold"
  startDate: string
  endDate: string
  members: string[]
  tasks: Task[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ProjectSample {
  id: string
  title: string
  description: string
  status: "planning" | "active" | "completed" | "on-hold"
  startDate: string
  endDate: string
  members: string[]
  tasks: Task[]
  createdBy: string
  createdAt: string
  updatedAt: string
}