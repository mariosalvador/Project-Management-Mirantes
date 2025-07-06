"use client"

import { useState, useContext, createContext, ReactNode, useCallback } from 'react';
import { Activity, ActivityType, ActivityData, ActivityFilter, ActivityGrouped } from '@/types/activity';
import { usePermissions } from './usePermissions';

interface ActivityContextType {
  activities: Activity[];
  groupedActivities: ActivityGrouped[];
  unreadCount: number;
  filters: ActivityFilter;
  addActivity: (type: ActivityType, data: ActivityData, options?: { projectId?: string; taskId?: string; targetUserId?: string }) => void;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  updateFilters: (filters: Partial<ActivityFilter>) => void;
  clearFilters: () => void;
  getActivitiesByProject: (projectId: string) => Activity[];
  getActivitiesByTask: (taskId: string) => Activity[];
  getActivitiesByUser: (userId: string) => Activity[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { currentUser } = usePermissions();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<ActivityFilter>({});

  // Filtrar atividades baseado nos filtros ativos
  const filteredActivities = activities.filter(activity => {
    // Filtro por tipo
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(activity.type)) return false;
    }

    // Filtro por usuário
    if (filters.userId && activity.userId !== filters.userId) return false;

    // Filtro por projeto
    if (filters.projectId && activity.projectId !== filters.projectId) return false;

    // Filtro por tarefa
    if (filters.taskId && activity.taskId !== filters.taskId) return false;

    // Filtro por apenas não lidas
    if (filters.onlyUnread && activity.isRead) return false;

    // Filtro por intervalo de data
    if (filters.dateRange) {
      const activityDate = new Date(activity.createdAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);

      if (activityDate < startDate || activityDate > endDate) return false;
    }

    return true;
  });

  // Agrupar atividades por data
  const groupedActivities: ActivityGrouped[] = filteredActivities.reduce((groups, activity) => {
    const activityDate = new Date(activity.createdAt);
    const dateKey = activityDate.toLocaleDateString('pt-BR');

    const existingGroup = groups.find(group => group.date === dateKey);

    if (existingGroup) {
      existingGroup.activities.push(activity);
    } else {
      groups.push({
        date: dateKey,
        activities: [activity]
      });
    }

    return groups;
  }, [] as ActivityGrouped[]).map(group => ({
    ...group,
    activities: group.activities.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })).sort((a, b) => {
    const dateA = new Date(a.activities[0]?.createdAt || 0);
    const dateB = new Date(b.activities[0]?.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Contar atividades não lidas
  const unreadCount = activities.filter(activity => !activity.isRead).length;

  const addActivity = useCallback((
    type: ActivityType,
    data: ActivityData,
    options: { projectId?: string; taskId?: string; targetUserId?: string } = {}
  ) => {
    if (!currentUser) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      title: data.taskTitle || data.projectTitle || type,
      description: data.commentContent || '',
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      projectId: options.projectId,
      taskId: options.taskId,
      targetUserId: options.targetUserId,
      data,
      createdAt: new Date().toISOString(),
      isRead: false,
      priority: 'medium'
    };

    setActivities(prev => [newActivity, ...prev]);
  }, [currentUser]);

  const markAsRead = useCallback((activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, isRead: true }
          : activity
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setActivities(prev =>
      prev.map(activity => ({ ...activity, isRead: true }))
    );
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ActivityFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getActivitiesByProject = useCallback((projectId: string) => {
    return activities.filter(activity => activity.projectId === projectId);
  }, [activities]);

  const getActivitiesByTask = useCallback((taskId: string) => {
    return activities.filter(activity => activity.taskId === taskId);
  }, [activities]);

  const getActivitiesByUser = useCallback((userId: string) => {
    return activities.filter(activity => activity.userId === userId);
  }, [activities]);

  return (
    <ActivityContext.Provider
      value={{
        activities: filteredActivities,
        groupedActivities,
        unreadCount,
        filters,
        addActivity,
        markAsRead,
        markAllAsRead,
        updateFilters,
        clearFilters,
        getActivitiesByProject,
        getActivitiesByTask,
        getActivitiesByUser
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
