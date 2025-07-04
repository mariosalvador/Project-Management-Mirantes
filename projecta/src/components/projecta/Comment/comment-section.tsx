"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  Send,
  AtSign,
  Paperclip
} from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { formatTimeAgo } from '@/utils/formatters';
import { CommentSectionProps } from '@/types/comments';
import { CommentItem } from './commentItem';


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
