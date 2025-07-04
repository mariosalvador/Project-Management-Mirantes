"use client"

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  Plus,
  Search
} from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

interface FileManagerProps {
  projectId?: string;
  projectTitle?: string;
  className?: string;
}

export function FileManager({ projectId, projectTitle, className }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'documento-requisitos.pdf',
      size: 2457600, // 2.4 MB
      type: 'application/pdf',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
      uploadedBy: 'Ana Silva'
    },
    {
      id: '2',
      name: 'mockup-interface.png',
      size: 1048576, // 1 MB
      type: 'image/png',
      uploadedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      uploadedBy: 'João Costa'
    },
    {
      id: '3',
      name: 'apresentacao-projeto.pptx',
      size: 5242880, // 5 MB
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      uploadedAt: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
      uploadedBy: 'Maria Santos'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook para logging de atividades
  const { logFileUploaded, logFileDeleted } = useActivityLogger();

  const getFileIcon = (type: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora há pouco';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
    return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    selectedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Usuário Atual' // Seria obtido do contexto real
      };

      setFiles(prev => [newFile, ...prev]);

      // Registrar atividade de upload
      if (projectId && projectTitle) {
        logFileUploaded({
          projectId: projectId,
          projectTitle: projectTitle
        }, file.name);
      }
    });

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setFiles(prev => prev.filter(f => f.id !== fileId));

      // Registrar atividade de exclusão
      if (projectId && projectTitle) {
        logFileDeleted({
          projectId: projectId,
          projectTitle: projectTitle
        }, file.name);
      }
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Arquivos do Projeto
          </CardTitle>
          <Badge variant="secondary">
            {files.length} arquivo{files.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
        </div>

        {/* Lista de Arquivos */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum arquivo encontrado</h3>
                <p className="text-sm">Tente ajustar os termos de busca</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum arquivo ainda</h3>
                <p className="text-sm mb-4">Faça upload dos primeiros arquivos do projeto</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Ícone do arquivo */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>por {file.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(file.uploadedAt)}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
