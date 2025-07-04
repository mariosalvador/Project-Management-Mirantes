import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Play, Pause } from "lucide-react"

interface StatusIndicatorProps {
  status: 'active' | 'completed' | 'planning' | 'on-hold'
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function StatusIndicator({
  status,
  className,
  showIcon = true,
  size = "md"
}: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      icon: Play,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Ativo"
    },
    completed: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Concluído"
    },
    planning: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Planejamento"
    },
    "on-hold": {
      icon: Pause,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Pausado"
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  )
}
