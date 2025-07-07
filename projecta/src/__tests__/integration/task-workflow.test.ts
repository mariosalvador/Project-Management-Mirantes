import { renderHook, act } from '@testing-library/react';
import { useCollaborationData } from '@/hooks/useCollaborationData';
import { useNotifications } from '@/hooks/useNotifications';
import { useComments } from '@/hooks/useComments';
import * as projectsService from '@/Api/services/projects';
import * as notificationsService from '@/Api/services/notifications';
import * as commentsService from '@/Api/services/comments';
import { useAuth } from '@/contexts/AuthContext';

// Mock todos os serviços
jest.mock('@/Api/services/projects');
jest.mock('@/Api/services/notifications');
jest.mock('@/Api/services/comments');
jest.mock('@/contexts/AuthContext');

const mockProjectsService = projectsService as jest.Mocked<typeof projectsService>;
const mockNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;
const mockCommentsService = commentsService as jest.Mocked<typeof commentsService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Integração: Fluxo Completo de Tarefa', () => {
  const mockUser = {
    uid: 'user1',
    email: 'user@test.com',
    displayName: 'Test User'
  };

  const mockProject = {
    id: 'project1',
    title: 'Test Project',
    description: 'Test description',
    status: 'active' as const,
    priority: 'medium' as const,
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    teamMembers: ['user1', 'user2'],
    tasks: []
  };

  const mockTask = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending' as const,
    priority: 'high' as const,
    assignedTo: ['user2'],
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

  describe('Fluxo: Criar tarefa → Notificar → Comentar', () => {
    it('deve executar fluxo completo de criação de tarefa com notificação e comentário', async () => {
      // Setup mocks
      mockProjectsService.getProjects.mockResolvedValue([mockProject]);
      mockProjectsService.createTask.mockResolvedValue('task1');
      mockNotificationsService.createNotification.mockResolvedValue('notif1');
      mockCommentsService.createComment.mockResolvedValue('comment1');
      mockCommentsService.getComments.mockResolvedValue([]);

      // 1. Inicializar hook de colaboração
      const { result: collaborationResult } = renderHook(() =>
        useCollaborationData('project1')
      );

      // 2. Inicializar hook de notificações
      const { result: notificationsResult } = renderHook(() =>
        useNotifications()
      );

      // 3. Inicializar hook de comentários
      const { result: commentsResult } = renderHook(() =>
        useComments({
          contextType: 'task',
          contextId: 'task1',
          projectId: 'project1'
        })
      );

      // 4. Criar nova tarefa
      await act(async () => {
        await collaborationResult.current.addTask(mockTask);
      });

      // 5. Verificar se tarefa foi criada
      expect(mockProjectsService.createTask).toHaveBeenCalledWith(
        'project1',
        expect.objectContaining({
          title: 'Test Task',
          assignedTo: ['user2']
        })
      );

      // 6. Simular notificação de atribuição
      await act(async () => {
        await notificationsResult.current.notifyTaskAssigned(
          mockTask,
          'Test Project',
          'user2'
        );
      });

      // 7. Verificar se notificação foi criada
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_assigned',
        title: 'Nova tarefa atribuída',
        message: 'Você foi atribuído à tarefa "Test Task" no projeto "Test Project"',
        userId: 'user2',
        priority: 'medium',
        projectId: 'project1',
        taskId: 'task1'
      });

      // 8. Adicionar comentário na tarefa
      act(() => {
        commentsResult.current.setNewComment('Tarefa criada com sucesso!');
      });

      await act(async () => {
        await commentsResult.current.handleAddComment();
      });

      // 9. Verificar se comentário foi criado
      expect(mockCommentsService.createComment).toHaveBeenCalledWith({
        content: 'Tarefa criada com sucesso!',
        contextType: 'task',
        contextId: 'task1',
        projectId: 'project1',
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'user@test.com'
        }
      });

      // 10. Verificar estado final
      expect(commentsResult.current.newComment).toBe('');
      expect(commentsResult.current.canUserComment).toBe(true);
    });
  });

  describe('Fluxo: Atualizar tarefa → Notificar mudança → Verificar prazo', () => {
    it('deve executar fluxo de atualização com notificações de mudança e prazo', async () => {
      // Setup mocks
      const updatedTask = {
        ...mockTask,
        status: 'in_progress' as const,
        dueDate: new Date(Date.now() + 172800000) // 2 dias no futuro
      };

      mockProjectsService.updateTask.mockResolvedValue(true);
      mockNotificationsService.createNotification.mockResolvedValue('notif1');

      const { result: collaborationResult } = renderHook(() =>
        useCollaborationData('project1')
      );

      const { result: notificationsResult } = renderHook(() =>
        useNotifications()
      );

      // 1. Atualizar tarefa
      await act(async () => {
        await collaborationResult.current.updateTask('task1', updatedTask);
      });

      // 2. Verificar se tarefa foi atualizada
      expect(mockProjectsService.updateTask).toHaveBeenCalledWith(
        'project1',
        'task1',
        expect.objectContaining({
          status: 'in_progress'
        })
      );

      // 3. Notificar mudança de status
      await act(async () => {
        await notificationsResult.current.notifyTaskStatusChange(
          updatedTask,
          'pending',
          'in_progress',
          'Test Project',
          'user2'
        );
      });

      // 4. Verificar notificação de mudança
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_status_changed',
        title: 'Status da tarefa alterado',
        message: 'O status da tarefa "Test Task" no projeto "Test Project" foi alterado de pending para in_progress',
        userId: 'user2',
        priority: 'medium',
        projectId: 'project1',
        taskId: 'task1'
      });

      // 5. Simular notificação de prazo (2 dias antes)
      await act(async () => {
        await notificationsResult.current.notifyTaskDeadline(
          updatedTask,
          2,
          'Test Project'
        );
      });

      // 6. Verificar notificação de prazo
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_deadline',
        title: 'Prazo da tarefa se aproximando',
        message: 'A tarefa "Test Task" no projeto "Test Project" vence em 2 dia(s)',
        userId: 'user1',
        priority: 'high',
        projectId: 'project1',
        taskId: 'task1'
      });
    });
  });

  describe('Fluxo: Tarefa vencida → Notificar → Deletar', () => {
    it('deve executar fluxo de tarefa vencida e deleção', async () => {
      // Setup mocks
      const overdueTask = {
        ...mockTask,
        dueDate: new Date(Date.now() - 86400000) // 1 dia no passado
      };

      mockProjectsService.deleteTask.mockResolvedValue(true);
      mockNotificationsService.createNotification.mockResolvedValue('notif1');

      const { result: collaborationResult } = renderHook(() =>
        useCollaborationData('project1')
      );

      const { result: notificationsResult } = renderHook(() =>
        useNotifications()
      );

      // 1. Notificar tarefa vencida
      await act(async () => {
        await notificationsResult.current.notifyTaskOverdue(
          overdueTask,
          'Test Project'
        );
      });

      // 2. Verificar notificação de vencimento
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        type: 'task_overdue',
        title: 'Tarefa vencida',
        message: 'A tarefa "Test Task" no projeto "Test Project" está vencida',
        userId: 'user1',
        priority: 'high',
        projectId: 'project1',
        taskId: 'task1'
      });

      // 3. Deletar tarefa vencida (com permissão)
      await act(async () => {
        await collaborationResult.current.deleteTask('task1');
      });

      // 4. Verificar se tarefa foi deletada
      expect(mockProjectsService.deleteTask).toHaveBeenCalledWith(
        'project1',
        'task1',
        'user1'
      );
    });
  });

  describe('Fluxo: Erro handling', () => {
    it('deve lidar com erros graciosamente em todo o fluxo', async () => {
      // Setup mocks para falhas
      mockProjectsService.createTask.mockRejectedValue(new Error('Falha na criação'));
      mockNotificationsService.createNotification.mockRejectedValue(new Error('Falha na notificação'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result: collaborationResult } = renderHook(() =>
        useCollaborationData('project1')
      );

      const { result: notificationsResult } = renderHook(() =>
        useNotifications()
      );

      // 1. Tentar criar tarefa (deve falhar)
      await act(async () => {
        try {
          await collaborationResult.current.addTask(mockTask);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      // 2. Tentar criar notificação (deve falhar graciosamente)
      await act(async () => {
        await notificationsResult.current.notifyTaskAssigned(
          mockTask,
          'Test Project',
          'user2'
        );
      });

      // 3. Verificar se erros foram logados
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Fluxo: Permissions', () => {
    it('deve respeitar permissões em todo o fluxo', async () => {
      // Setup usuário sem permissões
      const unauthorizedUser = {
        uid: 'user3',
        email: 'unauthorized@test.com',
        displayName: 'Unauthorized User'
      };

      mockUseAuth.mockReturnValue({
        user: unauthorizedUser,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn()
      });

      const { result: collaborationResult } = renderHook(() =>
        useCollaborationData('project1')
      );

      const { result: commentsResult } = renderHook(() =>
        useComments({
          contextType: 'task',
          contextId: 'task1',
          projectId: 'project1',
          allowedUsers: ['user1', 'user2'] // Usuário não autorizado
        })
      );

      // 1. Verificar se não pode comentar
      expect(commentsResult.current.canUserComment).toBe(false);

      // 2. Verificar se não pode deletar tarefa
      expect(collaborationResult.current.canDeleteTask('task1')).toBe(false);

      // 3. Tentar deletar tarefa (deve falhar)
      mockProjectsService.deleteTask.mockRejectedValue(new Error('Sem permissão'));

      await act(async () => {
        try {
          await collaborationResult.current.deleteTask('task1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });
});
