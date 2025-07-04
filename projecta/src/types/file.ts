

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface FileManagerProps {
  projectId?: string;
  projectTitle?: string;
  className?: string;
}
