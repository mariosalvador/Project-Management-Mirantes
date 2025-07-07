import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';
import * as notificationsService from '@/Api/services/notifications';
import { useAuth } from '@/contexts/AuthContext';

// Mock dos serviços
jest.mock('@/Api/services/notifications');
jest.mock('@/contexts/AuthContext');

const mockNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useNotifications', () => {
  const mockUser = {
    uid: 'user1',
    email: 'user@test.com',
    displayName: 'Test User'
  };

  const mockNotifications = [
    {
      id: 'notif1',
      type: 'task_assigned',
      title: 'Nova tarefa atribuída',
      message: 'Você foi atribuído à tarefa Test Task',
      userId: 'user1',
      isRead: false,
      createdAt: new Date(),
      projectId: 'project1',
      taskId: 'task1',
      priority: 'medium' as const
    }
  ];

  const mockTask = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test description',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: ['user1'],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date(Date.now() + 86400000), // 1 dia no futuro
    projectId: 'project1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn()
    });
  });

  describe('carregar notificações', () => {
    it('deve carregar notificações com sucesso', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.getUnreadNotificationsCount.mockResolvedValue(1);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.notifications).toEqual(mockNotifications);
      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith('user1');
    });

    it('deve lidar com erro ao carregar notificações', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotificationsService.getUserNotifications.mockRejectedValue(new Error('Erro teste'));

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      expect(result.current.notifications).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar notificações:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('marcar como lida', () => {
    it('deve marcar notificação como lida', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.markNotificationAsRead.mockResolvedValue(true);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      await act(async () => {
        await result.current.markAsRead('notif1');
      });

      expect(mockNotificationsService.markNotificationAsRead).toHaveBeenCalledWith('notif1');
    });

    it('deve marcar todas as notificações como lidas', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.markAllNotificationsAsRead.mockResolvedValue(true);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockNotificationsService.markAllNotificationsAsRead).toHaveBeenCalledWith('user1');
    });
  });

  describe('deletar notificação', () => {
    it('deve deletar notificação com sucesso', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockNotifications);
      mockNotificationsService.deleteNotification.mockResolvedValue(true);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      await act(async () => {
        await result.current.deleteNotificationById('notif1');
      });

      expect(mockNotificationsService.deleteNotification).toHaveBeenCalledWith('notif1');
    });
  });

  describe('configurações de notificação', () => {
    it('deve atualizar configurações de notificação', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({
          emailNotifications: false,
          taskDeadlines: {
            enabled: false,
            daysBefore: 1
          }
        });
      });

      expect(result.current.settings.emailNotifications).toBe(false);
      expect(result.current.settings.taskDeadlines.enabled).toBe(false);
      expect(result.current.settings.taskDeadlines.daysBefore).toBe(1);
    });
  });

  describe('notificações de prazo', () => {
    it('deve criar notificação de prazo quando habilitada', async () => {
      mockNotificationsService.createNotification.mockResolvedValue();

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.notifyTaskDeadline(mockTask, 1, 'Test Project');
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_deadline',
        title: 'Prazo da tarefa se aproximando',
        message: 'A tarefa "Test Task" no projeto "Test Project" vence em 1 dia(s)',
        userId: 'user1',
        priority: 'high',
        projectId: 'project1',
        taskId: 'task1'
      });
    });

    it('não deve criar notificação quando configuração está desabilitada', async () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({
          taskDeadlines: { enabled: false, daysBefore: 2 }
        });
      });

      await act(async () => {
        await result.current.notifyTaskDeadline(mockTask, 1, 'Test Project');
      });

      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('não deve criar notificação quando não há usuário logado', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn()
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.notifyTaskDeadline(mockTask, 1, 'Test Project');
      });

      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe('notificações de tarefa vencida', () => {
    it('deve criar notificação de tarefa vencida', async () => {
      const overdueTask = {
        ...mockTask,
        dueDate: new Date(Date.now() - 86400000) // 1 dia no passado
      };

      mockNotificationsService.createNotification.mockResolvedValue();

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.notifyTaskOverdue(overdueTask, 'Test Project');
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_overdue',
        title: 'Tarefa vencida',
        message: 'A tarefa "Test Task" no projeto "Test Project" está vencida',
        userId: 'user1',
        priority: 'high',
        projectId: 'project1',
        taskId: 'task1'
      });
    });
  });

  describe('notificações de atribuição', () => {
    it('deve criar notificação de tarefa atribuída', async () => {
      mockNotificationsService.createNotification.mockResolvedValue();

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.notifyTaskAssigned(mockTask, 'Test Project', 'user2');
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_assigned',
        title: 'Nova tarefa atribuída',
        message: 'Você foi atribuído à tarefa "Test Task" no projeto "Test Project"',
        userId: 'user2',
        priority: 'medium',
        projectId: 'project1',
        taskId: 'task1'
      });
    });

    it('deve criar notificação de mudança de status', async () => {
      mockNotificationsService.createNotification.mockResolvedValue();

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.notifyTaskStatusChange(mockTask, 'pending', 'in_progress', 'Test Project', 'user2');
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_status_changed',
        title: 'Status da tarefa alterado',
        message: 'O status da tarefa "Test Task" no projeto "Test Project" foi alterado de pending para in_progress',
        userId: 'user2',
        priority: 'medium',
        projectId: 'project1',
        taskId: 'task1'
      });
    });
  });

  describe('estatísticas de notificação', () => {
    it('deve retornar estatísticas corretas', async () => {
      const mixedNotifications = [
        { ...mockNotifications[0], isRead: false, type: 'task_assigned' },
        { ...mockNotifications[0], id: 'notif2', isRead: true, type: 'task_deadline' },
        { ...mockNotifications[0], id: 'notif3', isRead: false, type: 'task_overdue' }
      ];

      mockNotificationsService.getUserNotifications.mockResolvedValue(mixedNotifications);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      const stats = result.current.getStats();

      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.byType.task_assigned).toBe(1);
      expect(stats.byType.task_deadline).toBe(1);
      expect(stats.byType.task_overdue).toBe(1);
    });
  });

  describe('filtros', () => {
    it('deve filtrar notificações por tipo', async () => {
      const mixedNotifications = [
        { ...mockNotifications[0], type: 'task_assigned' },
        { ...mockNotifications[0], id: 'notif2', type: 'task_deadline' },
        { ...mockNotifications[0], id: 'notif3', type: 'task_overdue' }
      ];

      mockNotificationsService.getUserNotifications.mockResolvedValue(mixedNotifications);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      act(() => {
        result.current.setFilter({ types: ['task_assigned'] });
      });

      const filtered = result.current.getFilteredNotifications();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('task_assigned');
    });

    it('deve filtrar notificações por status de leitura', async () => {
      const mixedNotifications = [
        { ...mockNotifications[0], isRead: false },
        { ...mockNotifications[0], id: 'notif2', isRead: true }
      ];

      mockNotificationsService.getUserNotifications.mockResolvedValue(mixedNotifications);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.fetchNotifications();
      });

      act(() => {
        result.current.setFilter({ isRead: false });
      });

      const filtered = result.current.getFilteredNotifications();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isRead).toBe(false);
    });
  });
});
