import { FileItem } from "@/types/file";


export const mockFiles: FileItem[] = [
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
  ];