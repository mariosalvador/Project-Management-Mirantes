
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  parentId?: string; // Para respostas/replies
  contextType: 'project' | 'task'; // Define se é comentário do projeto ou da tarefa
  contextId: string; // ID do projeto ou da tarefa
  projectId: string; // Sempre o ID do projeto para facilitar queries
  reactions?: {
    emoji: string;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  mentions?: {
    userId: string;
    userName: string;
    position: number;
  }[];
}

export interface CommentFormData {
  content: string;
  contextType: 'project' | 'task';
  contextId: string;
  projectId: string;
  parentId?: string;
}

export interface CommentSectionProps {
  projectId: string;
  taskId?: string;
  contextType: 'project' | 'task';
  contextId: string;
  className?: string;
  allowedUsers?: string[]; // Lista de usuários que podem ver/comentar
}

export interface CommentItemProps {
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
  canEdit: (comment: Comment) => boolean;
  canDelete: (comment: Comment) => boolean;
  formatTimeAgo: (date: string) => string;
}