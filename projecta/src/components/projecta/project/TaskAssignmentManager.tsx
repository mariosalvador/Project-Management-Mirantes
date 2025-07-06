"use client";

import { useState } from "react";
import { TeamMember } from "@/types/project";
import TaskTeamSelector from "./TaskTeamSelector";

interface TaskAssignmentManagerProps {
  projectMembers: TeamMember[];
  taskTitle?: string;
  onAssigneesChange?: (assignees: string[]) => void;
  initialAssignees?: string[];
}

export default function TaskAssignmentManager({
  projectMembers,
  taskTitle = "Nova Tarefa",
  onAssigneesChange,
  initialAssignees = []
}: TaskAssignmentManagerProps) {
  const [assignees, setAssignees] = useState<string[]>(initialAssignees);

  const handleAssigneesChange = (newAssignees: string[]) => {
    setAssignees(newAssignees);
    onAssigneesChange?.(newAssignees);
  };

  return (
    <TaskTeamSelector
      projectMembers={projectMembers}
      selectedAssignees={assignees}
      onAssigneesChange={handleAssigneesChange}
      taskTitle={taskTitle}
    />
  );
}
