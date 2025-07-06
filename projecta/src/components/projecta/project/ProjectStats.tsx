interface ProjectStatsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[]
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-card text-card-foreground rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-muted-foreground">Total de Projetos</h3>
        <p className="text-2xl font-bold">{projects.length}</p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-muted-foreground">Projetos Ativos</h3>
        <p className="text-2xl font-bold text-green-600">
          {projects.filter(p => p.status === 'active').length}
        </p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-muted-foreground">Em Planejamento</h3>
        <p className="text-2xl font-bold text-blue-600">
          {projects.filter(p => p.status === 'planning').length}
        </p>
      </div>
      <div className="bg-card text-card-foreground rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-muted-foreground">Concluídos</h3>
        <p className="text-2xl font-bold text-purple-600">
          {projects.filter(p => p.status === 'completed').length}
        </p>
      </div>
    </div>
  )
}
