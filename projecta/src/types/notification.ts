export interface Notification {
  id: string;
  type: 'team_invitation' | 'invite_accepted' | 'task_deadline' | 'task_status_change' | 'task_assignment' | 'project_assignment' | 'project_update' | 'overdue_task';
  title: string;
  message: string;
  userId: string;
  projectId: string;
  taskId?: string;
  invitationId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate?: string; // Para notificações de prazo
  actionUrl?: string; // URL para ação relacionada
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    assignedBy?: string;
    daysUntilDue?: number;
    invitedBy?: string;
    role?: string;
    projectTitle?: string;
    acceptedBy?: string;
    acceptedByEmail?: string;
    inviteId?: string;
  };
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  taskDeadlines: {
    enabled: boolean;
    daysBefore: number; // Quantos dias antes avisar
  };
  taskStatusChanges: {
    enabled: boolean;
    onlyMyTasks: boolean;
  };
  taskAssignments: {
    enabled: boolean;
  };
  projectAssignments: {
    enabled: boolean;
  };
  overdueReminders: {
    enabled: boolean;
    frequency: 'daily' | 'weekly'; // Frequência dos lembretes
  };
}

export interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
}

export type NotificationFilter = 'all' | 'unread' | 'urgent' | 'task_related' | 'project_related';

export interface NotificationFilterOptions {
  types: Notification['type'][];
  priority: Notification['priority'] | null;
  isRead: boolean | null;
  dateRange: 'today' | 'week' | 'month' | null;
}

export interface NotificationStats {
  total: number;
  unread: number;
  high: number;
  urgent: number;
  byType: {
    task_deadline: number;
    task_assignment: number;
    task_status_change: number;
    project_assignment: number;
    project_update: number;
    overdue_task: number;
    team_invitation: number;
    invite_accepted: number;
  };
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getTimeAgo: (date: string) => string;
  getNotificationIcon: (type: Notification['type']) => React.ReactNode;
  getPriorityColor: (priority: Notification['priority']) => string;
}