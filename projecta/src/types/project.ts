export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'pending';
  assignee: string;
  dueDate: string;
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
}
