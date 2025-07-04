"use client"

import { useState, useCallback } from 'react';
import { Comment, Activity, Reaction } from '@/types/collaboration';
import { usePermissions } from './usePermissions';

interface UseCommentsProps {
  projectId?: string;
  taskId?: string;
}

export function useComments({ projectId, taskId }: UseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { currentUser, hasPermission } = usePermissions();

  const addComment = useCallback((content: string, mentions: string[] = [], attachments = []) => {
    if (!currentUser || !hasPermission('comment', 'create')) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      mentions,
      attachments,
      reactions: []
    };

    setComments(prev => [...prev, newComment]);

    // Criar atividade
    const activity: Activity = {
      id: Date.now().toString(),
      type: 'comment_added',
      description: `${currentUser.name} adicionou um comentário`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      targetType: taskId ? 'task' : 'project',
      targetId: taskId || projectId || '',
      createdAt: new Date().toISOString()
    };

    setActivities(prev => [activity, ...prev]);
  }, [currentUser, hasPermission, taskId, projectId]);

  const updateComment = useCallback((commentId: string, content: string) => {
    if (!currentUser) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Verificar permissão (próprio comentário ou permissão de admin)
    if (!hasPermission('comment', 'update', comment.authorId)) return;

    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, content, updatedAt: new Date().toISOString(), isEdited: true }
        : c
    ));
  }, [currentUser, comments, hasPermission]);

  const deleteComment = useCallback((commentId: string) => {
    if (!currentUser) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Verificar permissão (próprio comentário ou permissão de admin)
    if (!hasPermission('comment', 'delete', comment.authorId)) return;

    setComments(prev => prev.filter(c => c.id !== commentId));
  }, [currentUser, comments, hasPermission]);

  const addReaction = useCallback((commentId: string, emoji: string) => {
    if (!currentUser) return;

    setComments(prev => prev.map(comment => {
      if (comment.id !== commentId) return comment;

      const existingReaction = comment.reactions?.find(r =>
        r.userId === currentUser.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remover reação se já existe
        return {
          ...comment,
          reactions: comment.reactions?.filter(r =>
            !(r.userId === currentUser.id && r.emoji === emoji)
          ) || []
        };
      } else {
        // Adicionar nova reação
        const newReaction: Reaction = {
          id: Date.now().toString(),
          emoji,
          userId: currentUser.id,
          userName: currentUser.name,
          createdAt: new Date().toISOString()
        };

        return {
          ...comment,
          reactions: [...(comment.reactions || []), newReaction]
        };
      }
    }));
  }, [currentUser]);

  const replyToComment = useCallback((parentId: string, content: string) => {
    if (!currentUser || !hasPermission('comment', 'create')) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      parentId,
      reactions: []
    };

    setComments(prev => [...prev, reply]);
  }, [currentUser, hasPermission]);

  const mentionUser = useCallback((content: string) => {
    // Esta função pode ser usada para processar menções
    // e enviar notificações para os usuários mencionados
    return content.replace(/@(\w+)/g, (match, username) => {
      return `<span class="mention">@${username}</span>`;
    });
  }, []);

  return {
    comments,
    activities,
    addComment,
    updateComment,
    deleteComment,
    addReaction,
    replyToComment,
    mentionUser,
    canComment: hasPermission('comment', 'create'),
    canEdit: (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      return comment ? hasPermission('comment', 'update', comment.authorId) : false;
    },
    canDelete: (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      return comment ? hasPermission('comment', 'delete', comment.authorId) : false;
    }
  };
}
