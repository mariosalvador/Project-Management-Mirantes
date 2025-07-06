import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-muted-foreground",
  valueColor = "text-foreground"
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}
