import { File, FileText, ImageIcon, Video } from "lucide-react";


export const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="h-8 w-8 text-purple-500" />;
  } else if (type.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  } else if (type.includes('presentation')) {
    return <FileText className="h-8 w-8 text-orange-500" />;
  } else if (type.includes('document') || type.includes('text')) {
    return <FileText className="h-8 w-8 text-blue-500" />;
  } else {
    return <File className="h-8 w-8 text-gray-500" />;
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};