import { UserRole } from './collaboration';

export interface UserMember {
  id: string;
  userId: string; 
  memberUserId: string; 
  memberName: string;
  memberEmail: string;
  memberAvatar?: string;
  defaultRole: UserRole;
  addedAt: string;
  addedBy: string;
  isActive: boolean;
  lastActive?: string;
  notes?: string; 
  skills?: string[]; 
}

export interface MemberInvitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  invitedByEmail: string;
  defaultRole: UserRole;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  message?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  pending: number;
  byRole: Record<UserRole, number>;
}

export interface ProjectMemberAssignment {
  id: string;
  projectId: string;
  projectTitle: string;
  memberUserId: string;
  memberName: string;
  memberEmail: string;
  assignedRole: UserRole;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface TaskMemberAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  memberUserId: string;
  memberName: string;
  memberEmail: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}
