import { renderHook, act, waitFor } from '@testing-library/react';
import { useComments } from '@/hooks/useComments';
import * as commentsService from '@/Api/services/comments';
import { useAuth } from '@/contexts/AuthContext';

// Mock dos serviços
jest.mock('@/Api/services/comments');
jest.mock('@/contexts/AuthContext');

const mockCommentsService = commentsService as jest.Mocked<typeof commentsService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useComments', () => {
  const mockUser = {
    uid: 'user1',
    email: 'user@test.com',
    displayName: 'Test User'
  };

  const mockComments = [
    {
      id: 'comment1',
      content: 'Test comment',
      author: {
        id: 'user1',
        name: 'Test User',
        email: 'user@test.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: []
    }
  ];

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

  const defaultProps = {
    contextType: 'project' as const,
    contextId: 'project1',
    projectId: 'project1',
    allowedUsers: []
  };

  describe('carregar comentários', () => {
    it('deve carregar comentários com sucesso', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockComments);

      const { result } = renderHook(() => useComments(defaultProps));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toEqual(mockComments);
      expect(mockCommentsService.getComments).toHaveBeenCalledWith(
        'project',
        'project1',
        'project1'
      );
    });

    it('deve lidar com erro ao carregar comentários', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCommentsService.getComments.mockRejectedValue(new Error('Erro teste'));

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.comments).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar comentários:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('permissões de usuário', () => {
    it('deve permitir comentário quando não há restrições', () => {
      const { result } = renderHook(() => useComments(defaultProps));
      expect(result.current.canUserComment).toBe(true);
    });

    it('deve permitir comentário quando usuário está na lista permitida (email)', () => {
      const { result } = renderHook(() => useComments({
        ...defaultProps,
        allowedUsers: ['user@test.com', 'other@test.com']
      }));
      expect(result.current.canUserComment).toBe(true);
    });

    it('deve permitir comentário quando usuário está na lista permitida (displayName)', () => {
      const { result } = renderHook(() => useComments({
        ...defaultProps,
        allowedUsers: ['Test User', 'Other User']
      }));
      expect(result.current.canUserComment).toBe(true);
    });

    it('deve negar comentário quando usuário não está na lista permitida', () => {
      const { result } = renderHook(() => useComments({
        ...defaultProps,
        allowedUsers: ['other@test.com', 'Another User']
      }));
      expect(result.current.canUserComment).toBe(false);
    });

    it('deve negar comentário quando não há usuário logado', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn()
      });

      const { result } = renderHook(() => useComments(defaultProps));
      expect(result.current.canUserComment).toBe(false);
    });
  });

  describe('criar comentário', () => {
    it('deve criar comentário com sucesso', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockComments);
      mockCommentsService.createComment.mockResolvedValue({
        id: 'new-comment',
        ...mockComments[0],
        content: 'Novo comentário'
      });

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setNewComment('Novo comentário');
      });

      expect(result.current.newComment).toBe('Novo comentário');

      await act(async () => {
        await result.current.handleAddComment();
      });

      expect(mockCommentsService.createComment).toHaveBeenCalledWith({
        contextType: 'project',
        contextId: 'project1',
        projectId: 'project1',
        content: 'Novo comentário',
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'user@test.com'
        }
      });

      expect(result.current.newComment).toBe('');
    });

    it('deve limpar campo após adicionar comentário', async () => {
      mockCommentsService.getComments.mockResolvedValue([]);
      mockCommentsService.createComment.mockResolvedValue(mockComments[0]);

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setNewComment('Teste');
      });

      await act(async () => {
        await result.current.handleAddComment();
      });

      expect(result.current.newComment).toBe('');
    });
  });

  describe('atualizar comentário', () => {
    it('deve atualizar comentário com sucesso', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockComments);
      mockCommentsService.updateComment.mockResolvedValue(true);

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateComment('comment1', 'Comentário atualizado');
      });

      expect(mockCommentsService.updateComment).toHaveBeenCalledWith(
        'comment1',
        'Comentário atualizado'
      );
    });
  });

  describe('deletar comentário', () => {
    it('deve deletar comentário com sucesso', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockComments);
      mockCommentsService.deleteComment.mockResolvedValue(true);

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteComment('comment1');
      });

      expect(mockCommentsService.deleteComment).toHaveBeenCalledWith('comment1');
    });
  });

  describe('reações', () => {
    it('deve adicionar reação com sucesso', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockComments);
      mockCommentsService.addReaction.mockResolvedValue(true);

      const { result } = renderHook(() => useComments(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleReaction('comment1', '👍');
      });

      expect(mockCommentsService.addReaction).toHaveBeenCalledWith(
        'comment1',
        '👍',
        'user1'
      );
    });
  });
});
