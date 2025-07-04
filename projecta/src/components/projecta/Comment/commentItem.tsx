import { Card, CardContent } from "@/components/ui/card";
import { CommentItemProps } from "@/types/comments";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Reply, ThumbsUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CommentItem({
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
              <AvatarImage src={comment.authorName} />
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