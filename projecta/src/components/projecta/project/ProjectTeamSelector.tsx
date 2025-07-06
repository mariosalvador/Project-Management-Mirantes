"use client";

import { TeamMember } from "@/types/project";
import TeamMemberManager from "./TeamMemberManager";

interface ProjectTeamSelectorProps {
  selectedMembers: TeamMember[];
  onMembersChange: (members: TeamMember[]) => void;
}

export default function ProjectTeamSelector({
  selectedMembers,
  onMembersChange
}: ProjectTeamSelectorProps) {
  return (
    <TeamMemberManager
      selectedMembers={selectedMembers}
      onMembersChange={onMembersChange}
      title="Equipe do Projeto"
      description="Selecione os membros que farão parte deste projeto"
      allowInvites={true}
    />
  );
}
