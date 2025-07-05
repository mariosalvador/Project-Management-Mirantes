"use client"

import { useState, useCallback } from 'react';
import { Comment, Activity } from '@/types/collaboration';
import { usePermissions } from './usePermissions';

interface UseGenericCollaborationProps {
  contextId: string; // ID do projeto ou tarefa
  contextType: 'project' | 'task';
}

export function useGenericCollaboration({ contextId, contextType }: UseGenericCollaborationProps) {
  const { hasPermission, currentUser } = usePermissions();

  // Estado local para comentários e atividades
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Verificações de permissões simplificadas
  const canComment = hasPermission(contextType, 'comment');
  const canEdit = hasPermission(contextType, 'update');

  // Adicionar comentário
  const addComment = useCallback(async (content: string, mentions: string[] = []) => {
    if (!canComment || !currentUser || !content.trim()) return false;

    try {
      setLoading(true);

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content: content.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        mentions
      };

      setComments(prev => [...prev, newComment]);

      // Criar atividade para o comentário
      const commentActivity: Activity = {
        id: `activity-${Date.now()}`,
        type: 'comment_added',
        description: `${currentUser.name} adicionou um comentário`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        targetType: contextType,
        targetId: contextId,
        targetName: contextType === 'project' ? 'Projeto' : 'Tarefa',
        createdAt: new Date().toISOString(),
        metadata: { commentId: newComment.id }
      };

      setActivities(prev => [commentActivity, ...prev]);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canComment, currentUser, contextId, contextType]);

  // Editar comentário
  const editComment = useCallback(async (commentId: string, newContent: string) => {
    if (!canEdit || !currentUser || !newContent.trim()) return false;

    try {
      setLoading(true);

      setComments(prev => prev.map(comment => {
        if (comment.id === commentId && comment.authorId === currentUser.id) {
          return {
            ...comment,
            content: newContent.trim(),
            updatedAt: new Date().toISOString(),
            isEdited: true
          };
        }
        return comment;
      }));

      return true;
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, currentUser]);

  // Deletar comentário
  const deleteComment = useCallback(async (commentId: string) => {
    if (!canEdit || !currentUser) return false;

    try {
      setLoading(true);

      setComments(prev => prev.filter(comment =>
        !(comment.id === commentId && comment.authorId === currentUser.id)
      ));

      return true;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, currentUser]);

  // Adicionar reação a um comentário
  const addReaction = useCallback(async (commentId: string, emoji: string) => {
    if (!currentUser) return false;

    try {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const reactions = comment.reactions || [];
          const existingReaction = reactions.find(r =>
            r.userId === currentUser.id && r.emoji === emoji
          );

          if (existingReaction) {
            // Remove reação se já existe
            return {
              ...comment,
              reactions: reactions.filter(r => r.id !== existingReaction.id)
            };
          } else {
            // Adiciona nova reação
            const newReaction = {
              id: `reaction-${Date.now()}`,
              emoji,
              userId: currentUser.id,
              userName: currentUser.name,
              createdAt: new Date().toISOString()
            };
            return {
              ...comment,
              reactions: [...reactions, newReaction]
            };
          }
        }
        return comment;
      }));

      return true;
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
      return false;
    }
  }, [currentUser]);

  // Registrar atividade personalizada
  const logActivity = useCallback((type: Activity['type'], description: string, metadata?: Record<string, unknown>) => {
    if (!currentUser) return;

    const activity: Activity = {
      id: `activity-${Date.now()}`,
      type,
      description,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      targetType: contextType,
      targetId: contextId,
      targetName: contextType === 'project' ? 'Projeto' : 'Tarefa',
      createdAt: new Date().toISOString(),
      metadata
    };

    setActivities(prev => [activity, ...prev]);
  }, [currentUser, contextType, contextId]);

  // Carregar dados iniciais (simulado)
  const loadData = useCallback(async () => {
    setLoading(true);

    // Em uma aplicação real, aqui você carregaria os dados da API
    // Por enquanto, mantemos o estado vazio

    setLoading(false);
  }, []);

  // Limpar dados
  const clearData = useCallback(() => {
    setComments([]);
    setActivities([]);
  }, []);

  return {
    // Estado
    comments,
    activities,
    loading,

    // Permissões
    canComment,
    canEdit,

    // Estatísticas
    totalComments: comments.length,
    recentActivities: activities.slice(0, 10),

    // Ações
    addComment,
    editComment,
    deleteComment,
    addReaction,
    logActivity,
    loadData,
    clearData
  };
}

export default useGenericCollaboration;
