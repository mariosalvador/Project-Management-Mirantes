import { Notification } from "@/types/notification";
import { AlertTriangle, Bell, CheckCheck, Clock, FolderOpen, User } from "lucide-react";


export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'task_deadline':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'task_status_change':
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    case 'task_assignment':
      return <User className="h-4 w-4 text-green-500" />;
    case 'project_assignment':
      return <FolderOpen className="h-4 w-4 text-purple-500" />;
    case 'overdue_task':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d atrás`;

  return date.toLocaleDateString('pt-BR');
};


export const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/10';
    case 'high':
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/10';
    default:
      return 'border-l-gray-300';
  }
};