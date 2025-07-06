import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import { UserRole } from "@/types/collaboration";
import {
  UserMember,
  MemberInvitation,
  MemberStats,
  ProjectMemberAssignment,
  TaskMemberAssignment
} from "@/types/userMembers";


// Enviar convite para ser membro de um usuário
export const sendMemberInvite = async (
  email: string,
  defaultRole: UserRole,
  invitedBy: string,
  invitedByName: string,
  invitedByEmail: string,
  message?: string
): Promise<MemberInvitation> => {
  try {
    console.log('Iniciando sendMemberInvite com parâmetros:', { email, defaultRole, invitedBy, invitedByName, invitedByEmail });

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Por favor, insira um email válido');
    }

    // Validação: impedir auto-convite
    if (email.toLowerCase().trim() === invitedByEmail.toLowerCase().trim()) {
      throw new Error('Você não pode enviar um convite para si mesmo');
    }

    // Validação de parâmetros obrigatórios
    if (!invitedBy || !invitedByName || !invitedByEmail) {
      throw new Error('Dados do usuário que está enviando o convite são obrigatórios');
    }

    console.log('Verificando convite existente...');
    // Verificar se já existe um convite pendente ou se o usuário já é membro
    const existingInvite = await checkExistingMemberInvite(email, invitedBy);
    if (existingInvite) {
      throw new Error('Já existe um convite pendente para este usuário');
    }

    console.log('Verificando membro existente...');
    const existingMember = await checkExistingMember(email, invitedBy);
    if (existingMember) {
      throw new Error('Este usuário já é seu membro');
    }

    const inviteId = `member_${invitedBy}_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const invitation: MemberInvitation = {
      id: inviteId,
      email: email.toLowerCase().trim(),
      invitedBy,
      invitedByName,
      invitedByEmail,
      defaultRole,
      invitedAt: now.toISOString(),
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
      ...(message && { message }) // Só inclui message se tiver valor
    };

    console.log('Salvando convite no Firestore:', invitation);
    const inviteRef = doc(db, 'member_invitations', inviteId);
    await setDoc(inviteRef, invitation);

    console.log('Criando notificação...');
    // Criar notificação se o usuário já existir
    await createMemberInviteNotification(email, invitation);

    console.log('Convite enviado com sucesso:', inviteId);
    return invitation;
  } catch (error) {
    console.error('Erro detalhado ao enviar convite de membro:', error);
    throw error;
  }
};

// Verificar se já existe convite pendente
const checkExistingMemberInvite = async (email: string, invitedBy: string): Promise<boolean> => {
  try {
    const invitesRef = collection(db, 'member_invitations');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase().trim()),
      where('invitedBy', '==', invitedBy),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    console.log('Verificação de convite existente:', { email, invitedBy, exists, count: querySnapshot.size });
    return exists;
  } catch (error) {
    console.error('Erro ao verificar convite existente:', error);
    throw error;
  }
};

// Verificar se já é membro
const checkExistingMember = async (email: string, userId: string): Promise<boolean> => {
  try {
    const membersRef = collection(db, 'user_members');
    const q = query(
      membersRef,
      where('userId', '==', userId),
      where('memberEmail', '==', email.toLowerCase().trim()),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    console.log('Verificação de membro existente:', { email, userId, exists, count: querySnapshot.size });
    return exists;
  } catch (error) {
    console.error('Erro ao verificar membro existente:', error);
    throw error;
  }
};

// Criar notificação de convite
const createMemberInviteNotification = async (email: string, invitation: MemberInvitation) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const userId = userData.uid;

      const notificationId = `member_invite_${invitation.id}_${Date.now()}`;
      const notificationRef = doc(db, 'notifications', notificationId);

      await setDoc(notificationRef, {
        id: notificationId,
        type: 'member_invitation',
        title: 'Convite para ser Membro',
        message: `${invitation.invitedByName} te convidou para ser membro da sua equipe`,
        userId,
        invitationId: invitation.id,
        isRead: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        metadata: {
          invitedBy: invitation.invitedBy,
          invitedByName: invitation.invitedByName,
          defaultRole: invitation.defaultRole
        }
      });
    }
  } catch (error) {
    console.error('Erro ao criar notificação de convite:', error);
  }
};

// Aceitar convite de membro
export const acceptMemberInvite = async (
  inviteId: string,
  acceptedByUserId: string,
  acceptedByEmail: string,
  acceptedByName: string
): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'member_invitations', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      throw new Error('Convite não encontrado');
    }

    const invitation = inviteSnap.data() as MemberInvitation;

    if (invitation.status !== 'pending') {
      throw new Error('Este convite já foi processado');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new Error('Este convite expirou');
    }

    // Atualizar status do convite
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    });

    // Criar registro de membro
    const memberId = `${invitation.invitedBy}_${acceptedByUserId}`;
    const memberRef = doc(db, 'user_members', memberId);

    const member: UserMember = {
      id: memberId,
      userId: invitation.invitedBy,
      memberUserId: acceptedByUserId,
      memberName: acceptedByName,
      memberEmail: acceptedByEmail,
      defaultRole: invitation.defaultRole,
      addedAt: new Date().toISOString(),
      addedBy: invitation.invitedByName,
      isActive: true,
      lastActive: new Date().toISOString()
    };

    await setDoc(memberRef, member);

    return true;
  } catch (error) {
    console.error('Erro ao aceitar convite de membro:', error);
    throw error;
  }
};

// Recusar convite de membro
export const declineMemberInvite = async (inviteId: string): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'member_invitations', inviteId);
    await updateDoc(inviteRef, {
      status: 'declined',
      declinedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Erro ao recusar convite de membro:', error);
    throw error;
  }
};

// Cancelar convite de membro
export const cancelMemberInvite = async (inviteId: string): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'member_invitations', inviteId);
    await deleteDoc(inviteRef);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar convite de membro:', error);
    throw error;
  }
};

// ===== GESTÃO DE MEMBROS =====

// Obter membros de um usuário
export const getUserMembers = async (userId: string): Promise<UserMember[]> => {
  try {
    const membersRef = collection(db, 'user_members');
    const q = query(
      membersRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
      // orderBy('addedAt', 'desc') // Comentado temporariamente até criar o índice no Firestore
    );

    const querySnapshot = await getDocs(q);
    const members = querySnapshot.docs.map(doc => doc.data() as UserMember);

    // Ordenar manualmente por enquanto
    return members.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar membros do usuário:', error);
    return [];
  }
};

// Obter convites de membro enviados
export const getSentMemberInvites = async (userId: string): Promise<MemberInvitation[]> => {
  try {
    const invitesRef = collection(db, 'member_invitations');
    const q = query(
      invitesRef,
      where('invitedBy', '==', userId),
      where('status', '==', 'pending')
      // orderBy('invitedAt', 'desc') // Comentado temporariamente até criar o índice no Firestore
    );

    const querySnapshot = await getDocs(q);
    const invites = querySnapshot.docs.map(doc => doc.data() as MemberInvitation);

    // Ordenar manualmente por enquanto
    return invites.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar convites enviados:', error);
    return [];
  }
};

// Obter convites de membro recebidos
export const getReceivedMemberInvites = async (email: string): Promise<MemberInvitation[]> => {
  try {
    const invitesRef = collection(db, 'member_invitations');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
      // orderBy('invitedAt', 'desc') // Comentado temporariamente até criar o índice no Firestore
    );

    const querySnapshot = await getDocs(q);
    const invites = querySnapshot.docs.map(doc => doc.data() as MemberInvitation);

    // Ordenar manualmente por enquanto
    return invites.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar convites recebidos:', error);
    return [];
  }
};

// Remover membro
export const removeUserMember = async (memberId: string): Promise<boolean> => {
  try {
    const memberRef = doc(db, 'user_members', memberId);
    await updateDoc(memberRef, {
      isActive: false,
      removedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    throw error;
  }
};

// Atualizar papel padrão do membro
export const updateMemberDefaultRole = async (
  memberId: string,
  newRole: UserRole
): Promise<boolean> => {
  try {
    const memberRef = doc(db, 'user_members', memberId);
    await updateDoc(memberRef, {
      defaultRole: newRole,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Erro ao atualizar papel do membro:', error);
    throw error;
  }
};

// Obter estatísticas dos membros
export const getMemberStats = async (userId: string): Promise<MemberStats> => {
  try {
    const members = await getUserMembers(userId);
    const invites = await getSentMemberInvites(userId);

    const roleStats: Record<UserRole, number> = {
      admin: 0,
      manager: 0,
      member: 0,
      viewer: 0
    };

    members.forEach(member => {
      roleStats[member.defaultRole]++;
    });

    const activeCount = members.filter(member => {
      if (!member.lastActive) return false;
      const lastActive = new Date(member.lastActive);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastActive > dayAgo;
    }).length;

    return {
      total: members.length,
      active: activeCount,
      pending: invites.length,
      byRole: roleStats
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas dos membros:', error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      byRole: { admin: 0, manager: 0, member: 0, viewer: 0 }
    };
  }
};

// ===== ATRIBUIÇÃO A PROJETOS =====

// Adicionar membro a projeto
export const assignMemberToProject = async (
  projectId: string,
  projectTitle: string,
  memberUserId: string,
  memberName: string,
  memberEmail: string,
  assignedRole: UserRole,
  assignedBy: string
): Promise<boolean> => {
  try {
    const assignmentId = `${projectId}_${memberUserId}`;
    const assignmentRef = doc(db, 'project_member_assignments', assignmentId);

    const assignment: ProjectMemberAssignment = {
      id: assignmentId,
      projectId,
      projectTitle,
      memberUserId,
      memberName,
      memberEmail,
      assignedRole,
      assignedAt: new Date().toISOString(),
      assignedBy,
      isActive: true
    };

    await setDoc(assignmentRef, assignment);
    return true;
  } catch (error) {
    console.error('Erro ao atribuir membro ao projeto:', error);
    throw error;
  }
};

// Remover membro do projeto
export const removeMemberFromProject = async (
  projectId: string,
  memberUserId: string
): Promise<boolean> => {
  try {
    const assignmentId = `${projectId}_${memberUserId}`;
    const assignmentRef = doc(db, 'project_member_assignments', assignmentId);

    await updateDoc(assignmentRef, {
      isActive: false,
      removedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Erro ao remover membro do projeto:', error);
    throw error;
  }
};

// Obter membros do projeto
export const getProjectMembers = async (projectId: string): Promise<ProjectMemberAssignment[]> => {
  try {
    const assignmentsRef = collection(db, 'project_member_assignments');
    const q = query(
      assignmentsRef,
      where('projectId', '==', projectId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ProjectMemberAssignment);
  } catch (error) {
    console.error('Erro ao buscar membros do projeto:', error);
    return [];
  }
};

// ===== ATRIBUIÇÃO A TAREFAS =====

// Atribuir membro a tarefa
export const assignMemberToTask = async (
  taskId: string,
  taskTitle: string,
  projectId: string,
  memberUserId: string,
  memberName: string,
  memberEmail: string,
  assignedBy: string
): Promise<boolean> => {
  try {
    const assignmentId = `${taskId}_${memberUserId}`;
    const assignmentRef = doc(db, 'task_member_assignments', assignmentId);

    const assignment: TaskMemberAssignment = {
      id: assignmentId,
      taskId,
      taskTitle,
      projectId,
      memberUserId,
      memberName,
      memberEmail,
      assignedAt: new Date().toISOString(),
      assignedBy,
      isActive: true
    };

    await setDoc(assignmentRef, assignment);
    return true;
  } catch (error) {
    console.error('Erro ao atribuir membro à tarefa:', error);
    throw error;
  }
};

// Remover membro da tarefa
export const removeMemberFromTask = async (
  taskId: string,
  memberUserId: string
): Promise<boolean> => {
  try {
    const assignmentId = `${taskId}_${memberUserId}`;
    const assignmentRef = doc(db, 'task_member_assignments', assignmentId);

    await updateDoc(assignmentRef, {
      isActive: false,
      removedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Erro ao remover membro da tarefa:', error);
    throw error;
  }
};

// Obter membros da tarefa
export const getTaskMembers = async (taskId: string): Promise<TaskMemberAssignment[]> => {
  try {
    const assignmentsRef = collection(db, 'task_member_assignments');
    const q = query(
      assignmentsRef,
      where('taskId', '==', taskId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TaskMemberAssignment);
  } catch (error) {
    console.error('Erro ao buscar membros da tarefa:', error);
    return [];
  }
};
