
export interface CommentSectionProps {
  projectId?: string;
  taskId?: string;
  className?: string;
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
  canEdit: (id: string) => boolean;
  canDelete: (id: string) => boolean;
  formatTimeAgo: (date: string) => string;
}

export interface Comment {
  id: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
  reactions?: {
    emoji: string
    userId: string
    userName: string
    createdAt: string
  }[],
  content: string
  isEdited?: boolean
}