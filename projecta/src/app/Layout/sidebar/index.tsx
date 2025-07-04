
"use client"

import { useState, useEffect } from "react"
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
  FolderOpen,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Archive,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { useProjects } from "../project-context"
import { getNavigation } from "./navigation-items"
import { getProjectIcon, getStatusColor } from "./conditional"
import { useIsMobile, useIsTablet, useIsLaptop } from "@/lib/use-media-query"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const pathname = usePathname()
  const { projects } = useProjects()

  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isLaptop = useIsLaptop()

  // Auto-collapse baseado no tamanho da tela
  useEffect(() => {
    if (isMobile) {
      // No mobile, sempre expandido quando visível
      setIsCollapsed(false)
    } else if (isTablet || isLaptop) {
      // Tablet e laptop, colapsar por padrão para economizar espaço
      setIsCollapsed(true)
    } else {
      // Desktop, expandido por padrão
      setIsCollapsed(false)
    }
  }, [isMobile, isTablet, isLaptop])

  const recentProjects = projects
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5) || []

  const navigation = getNavigation(pathname, projects)

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300 overflow-auto",
        // Responsividade para largura
        isMobile
          ? "w-80" // Mobile: sempre largura total quando visível
          : isCollapsed
            ? "w-16" // Colapsado: largura mínima
            : isTablet
              ? "w-60" // Tablet: largura reduzida
              : "w-80", // Desktop/Laptop: largura completa
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
              <h2 className="text-lg font-semibold">ProJecta</h2>
              <p className="text-xs text-muted-foreground">Gerenciador de Projetos</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className={cn(
          "space-y-6",
          isMobile ? "p-4" : isTablet ? "p-3" : "p-4"
        )}>
          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="space-y-2">
              <Button asChild className="w-full justify-start text-sm">
                <Link href="/apk/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {isMobile || !isTablet ? "Novo Projeto" : "Novo"}
                </Link>
              </Button>
              <div className={""}>
                <Button variant="outline" size="sm" className="justify-start bg-transparent w-full">
                  <Search className="h-4 w-4 mr-1" />
                  {!isTablet && "Buscar"}
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
                  <Link key={project.id} href={`/apk/project/${project.title}`}>
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
