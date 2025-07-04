import { cn } from "@/lib/utils"
import { ProjectCard } from "./project-card"
import { Project } from "@/types/project"

interface ProjectGridProps {
  projects: Project[]
  className?: string
}

export function ProjectGrid({ projects, className }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Comece criando seu primeiro projeto para organizar suas tarefas e colaborar com sua equipe.
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid gap-4 md:gap-6",
      // Responsividade da grade
      "grid-cols-1",           // Mobile: 1 coluna
      "sm:grid-cols-2",        // Tablet pequeno: 2 colunas
      "lg:grid-cols-2",        // Laptop: 3 colunas
      "xl:grid-cols-2",        // Desktop: 4 colunas
      "2xl:grid-cols-5",       // Desktop grande: 5 colunas
      className
    )}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          className="h-full"
        />
      ))}
    </div>
  )
}
