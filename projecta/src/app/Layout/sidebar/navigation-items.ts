import { BarChart3, Calendar, FolderOpen, Home, Users } from "lucide-react";

interface Project {
  id: string;
  title: string;
  status: string;
  tasks: unknown[];
  updatedAt: string;
}

export const getNavigation = (pathname: string, projects: Project[] | undefined) => [
  {
    name: "Dashboard",
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
    name: "Calendário",
    href: "/apk/calendar",
    icon: Calendar,
    current: pathname === "/apk/calendar",
  },
  {
    name: "Equipe",
    href: "/apk/team",
    icon: Users,
    current: pathname === "/apk/team",
  },
  {
    name: "Relatórios",
    href: "/apk/reports",
    icon: BarChart3,
    current: pathname === "/apk/reports",
  },
]