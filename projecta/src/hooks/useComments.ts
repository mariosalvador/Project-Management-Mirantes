"use client"

import { useState, useCallback, useEffect } from 'react';
import { Comment } from '@/types/comments';
import { useAuth } from '@/contexts/AuthContext';
import {
  getComments,
  createComment,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
  addReaction
} from '@/Api/services/comments';

interface UseCommentsProps {
  contextType: 'project' | 'task';
  contextId: string;
  projectId: string;
  allowedUsers?: string[];
  taskId?: string
}

export function useComments({ contextType, contextId, projectId, allowedUsers = [] }: UseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  // Verificar se o usuário pode comentar
  const canUserComment = user && (
    allowedUsers.length === 0 ||
    allowedUsers.includes(user.email || '') ||
    allowedUsers.includes(user.displayName || '')
  );

  // Carregar comentários
  useEffect(() => {
    if (!contextId) return;

    const loadComments = async () => {
      try {
        setLoading(true);

        const fetchedComments = await getComments(contextType, contextId, projectId);

        setComments(fetchedComments);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [contextType, contextId, projectId]);

  // Submeter novo comentário
  const submitComment = useCallback(async () => {
    if (!user || !newComment.trim() || !canUserComment) {
      return;
    }

    try {
      const commentData = {
        content: newComment,
        contextType,
        contextId,
        projectId
      };

      await createComment(
        commentData,
        user.uid,
        user.displayName || user.email || 'Usuário',
        user.email || undefined,
        user.photoURL || undefined
      );


      // Recarregar comentários
      const updatedComments = await getComments(contextType, contextId, projectId);
      setComments(updatedComments);
      setNewComment('');

    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  }, [user, newComment, canUserComment, contextType, contextId, projectId]);

  // Editar comentário
  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user) return;

    try {
      await updateCommentService(commentId, content, user.uid);

      // Recarregar comentários
      const updatedComments = await getComments(contextType, contextId, projectId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    }
  }, [user, contextType, contextId, projectId]);

  // Deletar comentário
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      await deleteCommentService(commentId);

      // Recarregar comentários
      const updatedComments = await getComments(contextType, contextId, projectId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  }, [user, contextType, contextId, projectId]);

  // Adicionar reação
  const addReactionToComment = useCallback(async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      await addReaction(commentId, emoji, user.uid, user.displayName || user.email || 'Usuário');
      // Recarregar comentários
      const updatedComments = await getComments(contextType, contextId, projectId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    }
  }, [user, contextType, contextId, projectId]);

  // Responder a comentário
  const replyToComment = useCallback(async (parentId: string, content: string) => {
    if (!user || !content.trim() || !canUserComment) return;

    try {
      const commentData = {
        content,
        contextType,
        contextId,
        projectId,
        parentId
      };

      await createComment(
        commentData,
        user.uid,
        user.displayName || user.email || 'Usuário',
        user.email || undefined,
        user.photoURL || undefined
      );

      // Recarregar comentários
      const updatedComments = await getComments(contextType, contextId, projectId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Erro ao responder comentário:', error);
    }
  }, [user, canUserComment, contextType, contextId, projectId]);

  // Processar menções
  const mentionUser = useCallback((content: string) => {
    return content.replace(/@(\w+)/g, (match, username) => {
      return `<span class="mention">@${username}</span>`;
    });
  }, []);

  return {
    comments,
    loading,
    newComment,
    setNewComment,
    submitComment,
    canUserComment,
    addComment: submitComment,
    updateComment,
    deleteComment,
    addReaction: addReactionToComment,
    replyToComment,
    mentionUser,
    canComment: canUserComment,
    canEdit: (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      return comment ? comment.authorId === user?.uid : false;
    },
    canDelete: (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      return comment ? comment.authorId === user?.uid : false;
    }
  };
}
