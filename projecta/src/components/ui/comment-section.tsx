"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  Edit2,
  Trash2,
  Reply,
  ThumbsUp,
  Send,
  AtSign,
  Paperclip
} from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { Comment } from '@/types/collaboration';
import { cn } from '@/lib/utils';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface CommentSectionProps {
  projectId?: string;
  taskId?: string;
  className?: string;
}

export function CommentSection({ projectId, taskId, className }: CommentSectionProps) {
  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
    addReaction,
    replyToComment,
    canComment,
    canEdit,
    canDelete
  } = useComments({ projectId, taskId });

  // Hook para logging de atividades
  const { logCommentAdded, logCommentUpdated, logCommentDeleted } = useActivityLogger();

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addComment(newComment);

    // Registrar atividade de comentário
    if (projectId && taskId) {
      logCommentAdded({
        taskId: taskId,
        taskTitle: 'Tarefa', // Seria obtido do contexto real
        projectId: projectId,
        projectTitle: 'Projeto' // Seria obtido do contexto real
      });
    }

    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      updateComment(editingId, editContent);

      // Registrar atividade de edição de comentário
      if (projectId && taskId) {
        logCommentUpdated({
          taskId: taskId,
          taskTitle: 'Tarefa', // Seria obtido do contexto real
          projectId: projectId,
          projectTitle: 'Projeto' // Seria obtido do contexto real
        });
      }

      setEditingId(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);

    // Registrar atividade de exclusão de comentário
    if (projectId && taskId) {
      logCommentDeleted({
        taskId: taskId,
        taskTitle: 'Tarefa', // Seria obtido do contexto real
        projectId: projectId,
        projectTitle: 'Projeto' // Seria obtido do contexto real
      });
    }
  };

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      replyToComment(commentId, replyContent);
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  };

  // Organizar comentários com suas respostas
  const organizedComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId: string) => comments.filter(c => c.parentId === commentId);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Adicionar novo comentário */}
      {canComment && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/mariosalvador.png" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <AtSign className="h-4 w-4 mr-1" />
                    Mencionar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Anexar
                  </Button>
                </div>
                <Button onClick={handleSubmitComment} size="sm">
                  <Send className="h-4 w-4 mr-1" />
                  Comentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {organizedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment.id)}
            editingId={editingId}
            editContent={editContent}
            replyingTo={replyingTo}
            replyContent={replyContent}
            onEdit={handleEditComment}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => {
              setEditingId(null);
              setEditContent('');
            }}
            onDelete={handleDeleteComment}
            onReaction={addReaction}
            onReply={setReplyingTo}
            onSubmitReply={handleReply}
            onReplyContentChange={setReplyContent}
            onEditContentChange={setEditContent}
            canEdit={canEdit}
            canDelete={canDelete}
            formatTimeAgo={formatTimeAgo}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  editingId: string | null;
  editContent: string;
  replyingTo: string | null;
  replyContent: string;
  onEdit: (id: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onReaction: (commentId: string, emoji: string) => void;
  onReply: (id: string) => void;
  onSubmitReply: (id: string) => void;
  onReplyContentChange: (content: string) => void;
  onEditContentChange: (content: string) => void;
  canEdit: (id: string) => boolean;
  canDelete: (id: string) => boolean;
  formatTimeAgo: (date: string) => string;
}

function CommentItem({
  comment,
  replies,
  editingId,
  editContent,
  replyingTo,
  replyContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReaction,
  onReply,
  onSubmitReply,
  onReplyContentChange,
  onEditContentChange,
  canEdit,
  canDelete,
  formatTimeAgo
}: CommentItemProps) {
  const isEditing = editingId === comment.id;
  const isReplying = replyingTo === comment.id;

  const reactionCounts = comment.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header do comentário */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.authorAvatar} />
              <AvatarFallback>
                {comment.authorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <Badge variant="secondary" className="text-xs">
                    editado
                  </Badge>
                )}
              </div>

              {/* Conteúdo do comentário */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => onEditContentChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onSaveEdit}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={onCancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm">{comment.content}</p>
              )}

              {/* Reações */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex gap-1 mt-2">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onReaction(comment.id, emoji)}
                    >
                      {emoji} {count}
                    </Button>
                  ))}
                </div>
              )}

              {/* Ações do comentário */}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction(comment.id, '👍')}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Curtir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>
                {canEdit(comment.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(comment.id)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                )}
                {canDelete(comment.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>

              {/* Campo de resposta */}
              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Input
                    placeholder="Escreva uma resposta..."
                    value={replyContent}
                    onChange={(e) => onReplyContentChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSubmitReply(comment.id)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onSubmitReply(comment.id)}>
                      Responder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReply('')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Respostas */}
          {replies.length > 0 && (
            <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  editingId={editingId}
                  editContent={editContent}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  onEdit={onEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onDelete={onDelete}
                  onReaction={onReaction}
                  onReply={onReply}
                  onSubmitReply={onSubmitReply}
                  onReplyContentChange={onReplyContentChange}
                  onEditContentChange={onEditContentChange}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
