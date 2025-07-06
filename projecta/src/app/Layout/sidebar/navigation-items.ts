import { FolderOpen, Home, Users, Bell, MessageCircle, MessageSquare } from "lucide-react";
interface Project {
  id: string;
  title: string;
  status: string;
  tasks: unknown[];
  updatedAt: string;
}

export const getNavigation = (pathname: string, projects: Project[] | undefined) => [
  {
    name: "Painel",
    href: "/apk",
    icon: Home,
    current: pathname === "/apk",
  },
  {
    name: "Projetos",
    href: "/apk/project",
    icon: FolderOpen,
    current: pathname.startsWith("/apk/project"),
    badge: projects?.length || 0,
  },
  {
    name: "Colaboração",
    href: "/apk/collaboration/",
    icon: MessageCircle,
    current: pathname.startsWith("/apk/collaboration"),
  },
  {
    name: "Notificações",
    href: "/apk/notifications",
    icon: Bell,
    current: pathname === "/apk/notifications",
  },
  {
    name: "Equipe",
    href: "/apk/team",
    icon: Users,
    current: pathname === "/apk/team",
  },
    {
    name: "Convites de Equipe",
    href: "/apk/team/invites",
    icon: MessageSquare,
    current: pathname === "/apk/team/invites",
  },
]