"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart3,
  Filter,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";
import { useActivity } from "@/hooks/useActivity";
import { usePermissions } from "@/hooks/usePermissions";

export default function ActivityDashboardPage() {
  const { activities, unreadCount, getActivitiesByUser } = useActivity();
  const { users } = usePermissions();

  // Estatísticas das atividades
  const totalActivities = activities.length;
  const todayActivities = activities.filter(activity => {
    const today = new Date().toDateString();
    const activityDate = new Date(activity.createdAt).toDateString();
    return today === activityDate;
  }).length;

  const weekActivities = activities.filter(activity => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(activity.createdAt) >= weekAgo;
  }).length;

  // Usuários mais ativos (últimos 7 dias)
  const userActivityCount = users.map(user => ({
    user,
    count: getActivitiesByUser(user.id).filter(activity => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(activity.createdAt) >= weekAgo;
    }).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Tipos de atividade mais comuns
  const activityTypeCounts = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topActivityTypes = Object.entries(activityTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/apk" },
            { label: "Feed de Atividades" }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feed de Atividades</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as atividades dos seus projetos em tempo real
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Estatísticas */}
        <div className="lg:col-span-1 space-y-4">
          {/* Estatísticas gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de atividades</span>
                <Badge variant="secondary">{totalActivities}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje</span>
                <Badge variant="secondary">{todayActivities}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Esta semana</span>
                <Badge variant="secondary">{weekActivities}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Não lidas</span>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                  {unreadCount}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Usuários mais ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivityCount.map(({ user, count }) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
                {userActivityCount.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade esta semana
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tipos de atividade mais comuns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Atividades Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topActivityTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm truncate">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
                {topActivityTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filtros rápidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Hoje
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Esta Semana
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Minhas Atividades
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Minha Equipe
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feed principal */}
        <div className="lg:col-span-3">
          <ActivityFeed
            showFilters={true}
            className="h-fit"
          />
        </div>
      </div>
    </div>
  );
}
