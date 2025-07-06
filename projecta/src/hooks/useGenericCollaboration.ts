"use client"

import { useState, useCallback, useEffect } from 'react';
import { Comment, Activity } from '@/types/collaboration';
import { usePermissions } from './usePermissions';
import {
  getCollaborationData,
  createCollaborationContext,
  addComment as addCommentToFirebase,
  updateComment as updateCommentInFirebase,
  deleteComment as deleteCommentFromFirebase,
  addActivity,
  subscribeToCollaboration
} from '@/Api/services/collaboration';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseGenericCollaborationProps {
  contextId: string; // ID do projeto ou tarefa
  contextType: 'project' | 'task';
  contextTitle?: string;
}

export function useGenericCollaboration({
  contextId,
  contextType,
  contextTitle = 'Contexto'
}: UseGenericCollaborationProps) {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  // Estado para dados de colaboração do Firebase
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [collaborationId, setCollaborationId] = useState<string | null>(null);

  // Verificações de permissões
  const canComment = hasPermission(contextType, 'comment');
  const canEdit = hasPermission(contextType, 'update');

  // Carregar dados de colaboração do Firebase
  const loadCollaborationData = useCallback(async () => {
    try {
      setLoading(true);
      let collaborationData = await getCollaborationData(contextId, contextType);

      // Se não existir contexto de colaboração, criar um
      if (!collaborationData && user?.uid) {
        const newCollaborationId = await createCollaborationContext(
          contextId,
          contextType,
          contextTitle,
          [user.uid], // Iniciar com o usuário atual
          user.uid
        );

        // Buscar os dados recém-criados
        collaborationData = await getCollaborationData(contextId, contextType);
        setCollaborationId(newCollaborationId);
      }

      if (collaborationData) {
        setCollaborationId(collaborationData.id);
        setComments(collaborationData.comments || []);
        setActivities(collaborationData.activities || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de colaboração:', error);
      toast.error('Erro ao carregar dados de colaboração');
    } finally {
      setLoading(false);
    }
  }, [contextId, contextType, contextTitle, user?.uid]);

  // Configurar listener em tempo real
  useEffect(() => {
    if (!contextId || !contextType) return;

    let unsubscribe: (() => void) | null = null;

    const setupRealtimeListener = async () => {
      try {
        // Primeiro carregar os dados
        await loadCollaborationData();

        // Depois configurar o listener
        unsubscribe = subscribeToCollaboration(
          contextId,
          contextType,
          (collaborationData) => {
            if (collaborationData) {
              setComments(collaborationData.comments || []);
              setActivities(collaborationData.activities || []);
              setCollaborationId(collaborationData.id);
            }
          }
        );
      } catch (error) {
        console.error('Erro ao configurar listener de colaboração:', error);
      }
    };

    setupRealtimeListener();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [contextId, contextType, loadCollaborationData]);

  // Adicionar comentário ao Firebase
  const addComment = useCallback(async (content: string, mentions: string[] = []) => {
    if (!canComment || !user || !content.trim() || !collaborationId) return false;

    try {
      setLoading(true);

      // Garantir que não há valores undefined
      const newComment = {
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Usuário',
        ...(user.photoURL && { authorAvatar: user.photoURL }),
        mentions: mentions || []
      };

      await addCommentToFirebase(collaborationId, newComment);

      // Registrar atividade
      const activityData = {
        type: 'comment_added' as const,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuário',
        description: `${user.displayName || user.email} adicionou um comentário`,
        targetType: contextType,
        targetId: contextId,
        targetName: contextTitle,
        createdAt: new Date().toISOString(),
        metadata: { content: content.substring(0, 100) },
        ...(user.photoURL && { userAvatar: user.photoURL })
      };

      await addActivity(collaborationId, activityData);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [canComment, user, collaborationId, contextType, contextId, contextTitle]);

  // Editar comentário no Firebase
  const editComment = useCallback(async (commentId: string, newContent: string) => {
    if (!canEdit || !user || !newContent.trim() || !collaborationId) return false;

    try {
      setLoading(true);
      await updateCommentInFirebase(collaborationId, commentId, newContent);
      return true;
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      toast.error('Erro ao editar comentário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, user, collaborationId]);

  // Deletar comentário do Firebase
  const deleteComment = useCallback(async (commentId: string) => {
    if (!canEdit || !user || !collaborationId) return false;

    try {
      setLoading(true);
      await deleteCommentFromFirebase(collaborationId, commentId);
      return true;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [canEdit, user, collaborationId]);

  // Adicionar reação (implementação futura)
  const addReaction = useCallback(async (commentId: string, emoji: string) => {
    if (!user || !collaborationId) return false;

    try {
      // TODO: Implementar addReaction no Firebase
      console.log('Adicionar reação:', { commentId, emoji });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
      return false;
    }
  }, [user, collaborationId]);

  // Registrar atividade personalizada
  const logActivity = useCallback(async (type: Activity['type'], description: string, metadata?: Record<string, unknown>) => {
    if (!user || !collaborationId) return;

    try {
      const activityData = {
        type,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuário',
        description,
        targetType: contextType,
        targetId: contextId,
        targetName: contextTitle,
        createdAt: new Date().toISOString(),
        ...(metadata && { metadata }),
        ...(user.photoURL && { userAvatar: user.photoURL })
      };

      await addActivity(collaborationId, activityData);
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }, [user, collaborationId, contextType, contextId, contextTitle]);

  return {
    comments,
    activities,
    loading,
    canComment,
    canEdit,
    totalComments: comments.length,
    recentActivities: activities.slice(0, 10), // Últimas 10 atividades
    addComment,
    editComment,
    deleteComment,
    addReaction,
    logActivity,
    collaborationId
  };
}

export default useGenericCollaboration;
