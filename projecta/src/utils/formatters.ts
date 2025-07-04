import { ACTIVITY_TEMPLATES, ActivityType } from "@/types/activity";

export const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return "";

    // Se a data está no formato YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    // Se a data já está formatada, retorna como está
    return dateString;
  } catch {
    return dateString;
  }
};

export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

  if (isNaN(numValue)) return "R$ 0,00";

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getDaysUntilDeadline = (dateString: string): number => {
  try {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return "success";
  if (progress >= 50) return "default";
  if (progress >= 25) return "warning";
  return "danger";
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const formatTimeAgo = (date: string) => {
  try {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 0 ? 'agora' : `há ${diffMins} min`;
    } else if (diffHours < 24) {
      return `há ${diffHours}h`;
    } else if (diffDays < 7) {
      return `há ${diffDays} dias`;
    } else {
      return activityDate.toLocaleDateString('pt-BR');
    }
  } catch {
    return 'Data inválida';
  }
};

 export const getActivityTemplate = (type: ActivityType) => {
    return ACTIVITY_TEMPLATES[type] || {
      title: 'Atividade',
      getDescription: () => 'Atividade do sistema',
      icon: '📝',
      color: 'text-gray-600 bg-gray-50',
      priority: 'low' as const
    };
  };