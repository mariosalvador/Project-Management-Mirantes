import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ICardDashboardProps {
  title: string;
  total: number;
  active: number;
  icon?: React.ReactNode;
}

export const CardDashboard = ({active, title, total}:ICardDashboardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <div className="text-sm text-muted-foreground">Ativos: {active}</div>
      </CardContent>
    </Card>
  );
}