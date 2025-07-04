
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  FolderOpen,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Search,
  Bell,
  Star,
  Archive,
  Trash2,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { useProjects } from "./project-context"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const pathname = usePathname()
  const { projects } = useProjects()

  const navigation = [
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

  const projectStats = {
    active: projects?.filter((p) => p.status === "active").length || 0,
    completed: projects?.filter((p) => p.status === "completed").length || 0,
    planning: projects?.filter((p) => p.status === "planning").length || 0,
    onHold: projects?.filter((p) => p.status === "on-hold").length || 0,
  }

  const recentProjects = projects
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5) || []

  const getProjectIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "planning":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
      case "on-hold":
        return <Pause className="h-3 w-3 text-gray-500" />
      default:
        return <FolderOpen className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "on-hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-80",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ProjectHub</h2>
              <p className="text-xs text-muted-foreground">Gerenciador de Projetos</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/apk/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start bg-transparent">
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm" className="justify-start bg-transparent">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtrar
                </Button>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="space-y-2">
              <Button asChild size="icon" className="w-full">
                <Link href="/apk/project/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="w-full bg-transparent">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Separator />

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isCollapsed && "justify-center px-2")}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Project Stats */}
          {!isCollapsed && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Status dos Projetos</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium">Ativos</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{projectStats.active}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium">Concluídos</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{projectStats.completed}</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">Planejamento</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-600">{projectStats.planning}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950">
                  <div className="flex items-center space-x-2">
                    <Pause className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium">Pausados</span>
                  </div>
                  <p className="text-lg font-bold text-gray-600">{projectStats.onHold}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Recent Projects */}
          <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-between p-2", isCollapsed && "justify-center")}>
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">Projetos Recentes</span>
                    {isProjectsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </>
                )}
                {isCollapsed && <FolderOpen className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {recentProjects.length === 0
                ? !isCollapsed && <p className="text-xs text-muted-foreground p-2">Nenhum projeto encontrado</p>
                : recentProjects.map((project) => (
                  <Link key={project.id} href={`/apk/project/${project.id}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-2",
                        pathname === `/apk/project/${project.id}` && "bg-secondary",
                        isCollapsed && "justify-center",
                      )}
                    >
                      {!isCollapsed ? (
                        <div className="flex items-center space-x-2 w-full">
                          {getProjectIcon(project.status)}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="secondary" className={cn("text-xs", getStatusColor(project.status))}>
                                {project.status === "active"
                                  ? "Ativo"
                                  : project.status === "completed"
                                    ? "Concluído"
                                    : project.status === "planning"
                                      ? "Planejamento"
                                      : "Pausado"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{project.tasks.length} tarefas</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        getProjectIcon(project.status)
                      )}
                    </Button>
                  </Link>
                ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Quick Links */}
          {!isCollapsed && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Links Rápidos</h3>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Arquivados
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Lixeira
              </Button>
            </div>
          )}

          {isCollapsed && (
            <div className="space-y-1">
              <Button variant="ghost" size="icon" className="w-full">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={"github.com/mariosalvador.png"} alt={"mariosalvador"} />
                <AvatarFallback>{"M"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{"Mario Salvador"}</p>
                <p className="text-xs text-muted-foreground truncate">{"mariosalvador"}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="ghost" size="icon" className="w-full">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-full">
              <Avatar className="h-6 w-6">
                <AvatarImage src={"github.com/mariosalvador.png"} alt={"mariosalvador"} />
                <AvatarFallback className="text-xs">{"M"}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
