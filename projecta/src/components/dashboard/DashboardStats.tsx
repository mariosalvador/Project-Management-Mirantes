import { Clock, CheckCircle, AlertCircle, TrendingUp, Users, CheckSquare, BarChart3 } from "lucide-react"
import { StatCard } from "./StatCard"

interface DashboardStatsProps {
  stats: {
    total: number
    active: number
    completed: number
    planning: number
    onHold: number
  }
  totalTasks: number
  completedTasks: number
  totalTeamMembers: number
  avgProgress: number
}

export function DashboardStats({
  stats,
  totalTasks,
  completedTasks,
  totalTeamMembers,
  avgProgress
}: DashboardStatsProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Projetos"
          value={stats.total}
          subtitle={`${stats.active} ativos`}
          icon={TrendingUp}
        />

        <StatCard
          title="Projetos Ativos"
          value={stats.active}
          subtitle="Em andamento"
          icon={Clock}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />

        <StatCard
          title="Concluídos"
          value={stats.completed}
          subtitle="Finalizados"
          icon={CheckCircle}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />

        <StatCard
          title="Em Planejamento"
          value={stats.planning}
          subtitle="Sendo planejados"
          icon={AlertCircle}
          iconColor="text-yellow-500"
          valueColor="text-yellow-600"
        />
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total de Tarefas"
          value={totalTasks}
          subtitle={`${completedTasks} concluídas`}
          icon={CheckSquare}
        />

        <StatCard
          title="Membros da Equipe"
          value={totalTeamMembers}
          subtitle="Colaboradores ativos"
          icon={Users}
        />

        <StatCard
          title="Progresso Médio"
          value={`${avgProgress}%`}
          subtitle="Todos os projetos"
          icon={BarChart3}
        />
      </div>
    </>
  )
}
