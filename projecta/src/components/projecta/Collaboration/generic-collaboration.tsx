"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Edit,
  Trash2,
  Heart,
  ThumbsUp,
  Smile,
  Users,
  Activity,
  Clock
} from 'lucide-react';
import { useGenericCollaboration } from '@/hooks/useGenericCollaboration';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

interface GenericCollaborationProps {
  contextId: string;
  contextType: 'project' | 'task';
  contextTitle: string;
  membersIds?: string[]; // IDs dos membros que podem colaborar
  className?: string;
}

export function GenericCollaboration({
  contextId,
  contextType,
  contextTitle,
  membersIds = [],
  className
}: GenericCollaborationProps) {
  const { currentUser, users } = usePermissions();
  const {
    comments,
    loading,
    canComment,
    totalComments,
    recentActivities,
    addComment,
    editComment,
    deleteComment,
    addReaction
  } = useGenericCollaboration({ contextId, contextType, contextTitle });

  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  // Filtrar usuários que são membros do contexto
  const contextMembers = users.filter(user =>
    membersIds.length === 0 || membersIds.includes(user.id)
  );

  // Verificar se o usuário atual é membro
  const isCurrentUserMember = membersIds.length === 0 ||
    (currentUser && membersIds.includes(currentUser.id));

  const handleAddComment = async () => {
    if (!newComment.trim() || !isCurrentUserMember) return;

    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const success = await editComment(commentId, editContent);
    if (success) {
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleStartEdit = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    await addReaction(commentId, emoji);
  };

  const TabButton = ({ tab, children }: { tab: typeof activeTab, children: React.ReactNode }) => (
    <Button
      variant={activeTab === tab ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(tab)}
    >
      {children}
    </Button>
  );

  if (!isCurrentUserMember && membersIds.length > 0) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas membros do {contextType === 'project' ? 'projeto' : 'tarefa'} podem visualizar e participar da colaboração.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Colaboração - {contextTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {contextMembers.length} {contextMembers.length === 1 ? 'membro' : 'membros'} • {totalComments} {totalComments === 1 ? 'comentário' : 'comentários'}
              </p>
            </div>
            <div className="flex gap-2">
              <TabButton tab="comments">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comentários ({totalComments})
              </TabButton>
              <TabButton tab="activity">
                <Activity className="h-4 w-4 mr-2" />
                Atividades ({recentActivities.length})
              </TabButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Membros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Membros Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contextMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{member.name}</span>
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo das Abas */}
      {activeTab === 'comments' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Comentários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Adicionar novo comentário */}
            {canComment && isCurrentUserMember && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <Input
                  placeholder={`Adicione um comentário sobre ${contextType === 'project' ? 'este projeto' : 'esta tarefa'}...`}
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Comentário
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de comentários */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum comentário ainda</h3>
                  <p className="text-muted-foreground">
                    {canComment ? 'Seja o primeiro a comentar!' : 'Aguardando comentários...'}
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.isEdited && (
                            <Badge variant="outline" className="text-xs">editado</Badge>
                          )}
                        </div>

                        {/* Conteúdo do comentário */}
                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditContent(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editContent.trim()}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm mb-3">{comment.content}</p>

                            {/* Ações do comentário */}
                            <div className="flex items-center gap-2">
                              {/* Reações */}
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(comment.id, '👍')}
                                  className="h-6 px-2"
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {comment.reactions?.filter(r => r.emoji === '👍').length || 0}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(comment.id, '❤️')}
                                  className="h-6 px-2"
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  {comment.reactions?.filter(r => r.emoji === '❤️').length || 0}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(comment.id, '😊')}
                                  className="h-6 px-2"
                                >
                                  <Smile className="h-3 w-3 mr-1" />
                                  {comment.reactions?.filter(r => r.emoji === '😊').length || 0}
                                </Button>
                              </div>

                              {/* Ações de edição (apenas para o autor) */}
                              {currentUser?.id === comment.authorId && (
                                <div className="flex gap-1 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(comment.id, comment.content)}
                                    className="h-6 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="h-6 px-2 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma atividade ainda</h3>
                  <p className="text-muted-foreground">
                    As atividades aparecerão aqui conforme a colaboração acontece.
                  </p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.userAvatar} />
                      <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GenericCollaboration;
