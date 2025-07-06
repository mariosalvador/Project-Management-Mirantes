import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit
} from "firebase/firestore";
import { db } from "./firebase";

export interface NotificationData {
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
  dueDate?: string;
  actionUrl?: string;
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

// Criar notificação
export const createNotification = async (notificationData: Omit<NotificationData, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const notificationId = `${notificationData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notificationRef = doc(db, 'notifications', notificationId);

    const notification: NotificationData = {
      ...notificationData,
      id: notificationId,
      createdAt: new Date().toISOString()
    };

    await setDoc(notificationRef, notification);
    return notificationId;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

// Buscar notificações de um usuário
export const getUserNotifications = async (userId: string, limitCount: number = 50): Promise<NotificationData[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications: NotificationData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as NotificationData;
      notifications.push({ ...data, id: doc.id });
    });

    // Ordenar no cliente para evitar índice composto
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
};

// Buscar notificações não lidas
export const getUnreadNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    // Simplificar a query para evitar índices compostos
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const notifications: NotificationData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as NotificationData;
      notifications.push({ ...data, id: doc.id });
    });

    // Ordenar no cliente para evitar índice composto
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    return [];
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
    return true;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return false;
  }
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId);

    const updatePromises = unreadNotifications.map(notification =>
      markNotificationAsRead(notification.id)
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return false;
  }
};

// Deletar notificação
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return false;
  }
};

// Contar notificações não lidas
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId);
    return unreadNotifications.length;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
};

// Criar notificação de convite de equipe
export const createTeamInviteNotification = async (
  userId: string,
  projectId: string,
  projectTitle: string,
  invitedBy: string,
  role: string,
  invitationId: string
): Promise<string> => {
  return createNotification({
    type: 'team_invitation',
    title: 'Convite para Equipe',
    message: `Você foi convidado para participar do projeto "${projectTitle}" como ${role}`,
    userId,
    projectId,
    invitationId,
    isRead: false,
    priority: 'medium',
    actionUrl: '/team/invites',
    metadata: {
      invitedBy,
      role,
      projectTitle
    }
  });
};

// Criar notificação de prazo de tarefa
export const createTaskDeadlineNotification = async (
  userId: string,
  projectId: string,
  taskId: string,
  taskTitle: string,
  dueDate: string,
  daysUntilDue: number
): Promise<string> => {
  const priority = daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium';

  return createNotification({
    type: 'task_deadline',
    title: 'Prazo de Tarefa Próximo',
    message: `A tarefa "${taskTitle}" tem prazo em ${daysUntilDue} dia(s)`,
    userId,
    projectId,
    taskId,
    isRead: false,
    priority,
    dueDate,
    actionUrl: `/project/${projectId}/task/${taskId}`,
    metadata: {
      daysUntilDue
    }
  });
};

// Criar notificação de atribuição de tarefa
export const createTaskAssignmentNotification = async (
  userId: string,
  projectId: string,
  taskId: string,
  taskTitle: string,
  assignedBy: string
): Promise<string> => {
  return createNotification({
    type: 'task_assignment',
    title: 'Nova Tarefa Atribuída',
    message: `Você foi atribuído à tarefa "${taskTitle}"`,
    userId,
    projectId,
    taskId,
    isRead: false,
    priority: 'medium',
    actionUrl: `/project/${projectId}/task/${taskId}`,
    metadata: {
      assignedBy
    }
  });
};
