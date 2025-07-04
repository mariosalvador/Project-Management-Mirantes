import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Project } from "@/types/project"
import { getStatusColor, getStatusLabel } from "@/utils/tasksFormatters"

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 cursor-pointer",
      "w-full",
      className
    )}>
      <Link href={`/apk/project/${project.title}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate mb-1">
                {project.title}
              </CardTitle>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1 lg:line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn("text-xs", getStatusColor(project.status))}>
              {getStatusLabel(project.status)}
            </Badge>

            {project.progress !== undefined && (
              <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-20">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
            {project.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="truncate">{project.dueDate}</span>
              </div>
            )}

            {project.teamMembers !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project.teamMembers} membros</span>
              </div>
            )}

            {project.tasksCompleted !== undefined && project.totalTasks !== undefined && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{project.tasksCompleted}/{project.totalTasks} tarefas</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
