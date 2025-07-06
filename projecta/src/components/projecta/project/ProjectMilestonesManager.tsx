"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Flag, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { Milestone } from "@/types/project";

interface ProjectMilestonesManagerProps {
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
  projectStartDate?: string;
  projectDueDate?: string;
  errors?: Record<string, string>;
}

export default function ProjectMilestonesManager({
  milestones,
  onMilestonesChange,
  projectStartDate,
  projectDueDate,
  errors = {}
}: ProjectMilestonesManagerProps) {
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    date: ""
  });

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.date) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        date: newMilestone.date,
        status: "pending"
      };

      onMilestonesChange([...milestones, milestone]);
      setNewMilestone({ title: "", date: "" });
    }
  };

  const removeMilestone = (id: string) => {
    onMilestonesChange(milestones.filter(milestone => milestone.id !== id));
  };

  const updateMilestoneStatus = (id: string, status: Milestone['status']) => {
    onMilestonesChange(
      milestones.map(milestone =>
        milestone.id === id ? { ...milestone, status } : milestone
      )
    );
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Flag className="h-4 w-4 text-gray-600" />;
    }
  };

  const isMilestoneOverdue = (date: string, status: Milestone['status']) => {
    if (status === 'completed') return false;
    const today = new Date();
    const milestoneDate = new Date(date);
    return milestoneDate < today;
  };

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Marcos do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para adicionar novo marco */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="milestoneTitle">Título do Marco</Label>
            <Input
              id="milestoneTitle"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do marco"
            />
          </div>

          <div>
            <Label htmlFor="milestoneDate">Data Prevista</Label>
            <Input
              id="milestoneDate"
              type="date"
              value={newMilestone.date}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
              min={projectStartDate}
              max={projectDueDate}
            />
            {projectStartDate && projectDueDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Entre {projectStartDate} e {projectDueDate}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={addMilestone}
              className="w-full"
              disabled={!newMilestone.title || !newMilestone.date}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          </div>
        </div>

        {/* Lista de marcos */}
        {milestones.length > 0 && (
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={milestone.id}>
                <div className={`flex items-center justify-between p-4 border rounded-lg ${isMilestoneOverdue(milestone.date, milestone.status) ? 'border-red-200 bg-red-50' : ''
                  }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <div className="font-medium">{milestone.title}</div>
                      {isMilestoneOverdue(milestone.date, milestone.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Data prevista: {milestone.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status */}
                    <Select
                      value={milestone.status}
                      onValueChange={(value) => updateMilestoneStatus(milestone.id, value as Milestone['status'])}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>

                    <Badge className={getMilestoneStatusColor(milestone.status)}>
                      {milestone.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </Badge>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mostrar erros específicos do marco */}
                {errors[`milestone_${index}`] && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`milestone_${index}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {milestones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum marco definido ainda</p>
            <p className="text-sm">Adicione marcos para acompanhar etapas importantes do projeto</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
