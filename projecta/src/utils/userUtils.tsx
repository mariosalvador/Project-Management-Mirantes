import { UserRole } from "@/types/collaboration";
import { Crown, Eye, Shield, Users } from "lucide-react";


  export const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  export const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      member: 'Membro',
      viewer: 'Visualizador'
    };
    return labels[role];
  };

 export const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      admin: 'Acesso total ao sistema',
      manager: 'Pode gerenciar projetos e tarefas',
      member: 'Pode criar e editar tarefas',
      viewer: 'Apenas visualização'
    };
    return descriptions[role];
  };

  export const getPermissionsList = (role: UserRole) => {
    const permissions = {
      admin: ['Criar projetos', 'Editar tudo', 'Excluir tudo', 'Gerenciar usuários'],
      manager: ['Criar projetos', 'Editar projetos', 'Gerenciar tarefas', 'Atribuir tarefas'],
      member: ['Criar tarefas', 'Editar suas tarefas', 'Comentar', 'Ver projetos'],
      viewer: ['Ver projetos', 'Ver tarefas', 'Comentar']
    };
    return permissions[role];
  };

  export const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  };