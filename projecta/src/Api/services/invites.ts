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
import { createTeamInviteNotification, notifyInviteAccepted } from "./notifications";

export interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  projectId: string;
  projectTitle: string;
  invitedBy: string;
  invitedByName: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
}

export const sendTeamInvite = async (
  email: string,
  role: UserRole,
  projectId: string,
  projectTitle: string,
  invitedBy: string,
  invitedByName: string,
  currentUserEmail?: string
): Promise<TeamInvitation> => {
  try {
    if (currentUserEmail && email.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) {
      throw new Error('Você não pode enviar um convite para si mesmo');
    }

    const inviteId = `${projectId}_${email}_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const invitation: TeamInvitation = {
      id: inviteId,
      email: email.toLowerCase(),
      role,
      projectId,
      projectTitle,
      invitedBy,
      invitedByName,
      invitedAt: now.toISOString(),
      status: 'pending',
      expiresAt: expiresAt.toISOString()
    };

    const inviteRef = doc(db, 'team_invitations', inviteId);
    await setDoc(inviteRef, invitation);
    await createInviteNotificationIfUserExists(email, invitation);

    return invitation;
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    throw error;
  }
};

// Verificar se usuário existe e criar notificação
const createInviteNotificationIfUserExists = async (email: string, invitation: TeamInvitation) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const userId = userData.uid;

      await createTeamInviteNotification(
        userId,
        invitation.projectId,
        invitation.projectTitle,
        invitation.invitedByName,
        getRoleLabel(invitation.role),
        invitation.id
      );
    } 
  } catch (error) {
    console.error('Erro ao criar notificação de convite:', error);
  }
};

// Buscar convites pendentes de um projeto (apenas para quem criou os convites)
export const getProjectInvites = async (projectId: string, currentUserId?: string): Promise<TeamInvitation[]> => {
  try {

    const invitesRef = collection(db, 'team_invitations');
    const q = query(
      invitesRef,
      where('projectId', '==', projectId)
    );

    const querySnapshot = await getDocs(q);
    const invites: TeamInvitation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as TeamInvitation;
      if (currentUserId && data.invitedBy !== currentUserId) {
        return;
      }

      // Verificar se o convite expirou
      const now = new Date();
      const expiresAt = new Date(data.expiresAt);

      if (now > expiresAt && data.status === 'pending') {
        // Marcar como expirado
        updateInviteStatus(data.id, 'expired');
        data.status = 'expired';
      }
      invites.push({ ...data, id: doc.id });
    });

    // Filtrar e ordenar no cliente
    const filteredInvites = invites
      .filter(invite => invite.status === 'pending')
      .sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());

    return filteredInvites;
  } catch (error) {
    console.error('Erro ao buscar convites do projeto:', error);
    return [];
  }
};

// Buscar convites de um usuário (apenas seus próprios convites)
export const getUserInvites = async (email: string, currentUserEmail?: string): Promise<TeamInvitation[]> => {
  try {
    if (currentUserEmail && email.toLowerCase() !== currentUserEmail.toLowerCase()) {
      return [];
    }

    const invitesRef = collection(db, 'team_invitations');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase())
    );

    const querySnapshot = await getDocs(q);
    const invites: TeamInvitation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as TeamInvitation;

      // Verificar se o convite expirou
      const now = new Date();
      const expiresAt = new Date(data.expiresAt);

      if (now > expiresAt && data.status === 'pending') {
        updateInviteStatus(data.id, 'expired');
      } else if (data.status === 'pending') {
        invites.push({ ...data, id: doc.id });
      }
    });

    // Ordenar no cliente
    return invites.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar convites do usuário:', error);
    return [];
  }
};

// Aceitar convite
export const acceptInvite = async (inviteId: string, acceptingUserId: string, acceptingUserEmail: string, acceptingUserName: string): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'team_invitations', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      throw new Error('Convite não encontrado');
    }

    const invite = inviteSnap.data() as TeamInvitation;

    // Verificar se ainda está válido
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);

    if (now > expiresAt) {
      await updateInviteStatus(inviteId, 'expired');
      throw new Error('Convite expirado');
    }

    if (invite.status !== 'pending') {
      throw new Error('Convite já foi processado');
    }

    // 1. Atualizar status do convite
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: now.toISOString()
    });

    // 2. Adicionar usuário à equipe do projeto
    const { addProjectMember } = await import('./projectMembers');
    await addProjectMember(
      invite.projectId,
      acceptingUserId,
      acceptingUserEmail,
      acceptingUserName,
      invite.role
    );

    await notifyInviteAccepted(
      invite.invitedBy,
      invite.projectId,
      invite.projectTitle,
      acceptingUserName,
      acceptingUserEmail,
      inviteId
    );

    return true;
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    throw error;
  }
};

// Recusar convite
export const declineInvite = async (inviteId: string): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'team_invitations', inviteId);
    await updateDoc(inviteRef, {
      status: 'declined',
      declinedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Erro ao recusar convite:', error);
    throw error;
  }
};

// Cancelar convite
export const cancelInvite = async (inviteId: string): Promise<boolean> => {
  try {
    const inviteRef = doc(db, 'team_invitations', inviteId);
    await deleteDoc(inviteRef);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar convite:', error);
    throw error;
  }
};

// Atualizar status do convite
const updateInviteStatus = async (inviteId: string, status: TeamInvitation['status']) => {
  try {
    const inviteRef = doc(db, 'team_invitations', inviteId);
    await updateDoc(inviteRef, { status });
  } catch (error) {
    console.error('Erro ao atualizar status do convite:', error);
  }
};

// Helper para obter label da role
const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    member: 'Membro',
    viewer: 'Visualizador'
  };
  return roleLabels[role] || role;
};

// Buscar convites pendentes por email (função pública, sem restrições de segurança)
export const getPendingInvitesByEmail = async (email: string): Promise<TeamInvitation[]> => {
  try {
    const invitesRef = collection(db, 'team_invitations');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const invites: TeamInvitation[] = [];
    const now = new Date();

    for (const docSnap of querySnapshot.docs) {
      const invite = docSnap.data() as TeamInvitation;
      const expiresAt = new Date(invite.expiresAt);

      if (now > expiresAt) {
        // Marcar como expirado
        await updateInviteStatus(invite.id, 'expired');
      } else {
        invites.push({ ...invite, id: docSnap.id });
      }
    }

    return invites.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar convites por email:', error);
    return [];
  }
};

// Limpar notificações duplicadas de convites
export const cleanupDuplicateInviteNotifications = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('type', '==', 'team_invitation')
    );

    const querySnapshot = await getDocs(q);
    const notifications: { [invitationId: string]: string[] } = {};

    // Agrupar notificações por invitationId
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.invitationId) {
        if (!notifications[data.invitationId]) {
          notifications[data.invitationId] = [];
        }
        notifications[data.invitationId].push(doc.id);
      }
    });

    // Remover duplicatas (manter apenas a mais recente)
    for (const invitationId in notifications) {
      const notificationIds = notifications[invitationId];
      if (notificationIds.length > 1) {
        // Manter apenas a primeira (mais recente) e excluir as outras
        for (let i = 1; i < notificationIds.length; i++) {
          const notificationRef = doc(db, 'notifications', notificationIds[i]);
          await deleteDoc(notificationRef);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao limpar notificações duplicadas:', error);
  }
};

// Verificar se já existe notificação para um convite específico
const notificationExistsForInvite = async (userId: string, inviteId: string): Promise<boolean> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('invitationId', '==', inviteId),
      where('type', '==', 'team_invitation')
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar notificação existente:', error);
    return false;
  }
};

// Verificar convites pendentes ao fazer login ou criar conta
export const checkPendingInvitesOnLogin = async (email: string, userId: string, isNewUser: boolean = false) => {
  try {

    // Buscar convites pendentes para este email (sem restrições de segurança)
    const invitesRef = collection(db, 'team_invitations');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const pendingInvites: TeamInvitation[] = [];

    // Verificar se os convites ainda são válidos
    const now = new Date();
    for (const docSnap of querySnapshot.docs) {
      const invite = docSnap.data() as TeamInvitation;
      const expiresAt = new Date(invite.expiresAt);

      if (now > expiresAt) {
        await updateInviteStatus(invite.id, 'expired');
      } else {
        pendingInvites.push({ ...invite, id: docSnap.id });
      }
    }


    // Criar notificações para convites pendentes (evitando duplicatas)
    for (const invite of pendingInvites) {
      const notificationExists = await notificationExistsForInvite(userId, invite.id);

      if (!notificationExists) {
        const notificationId = `invite_${invite.id}_${userId}_${Date.now()}`;
        const notificationRef = doc(db, 'notifications', notificationId);

        const message = isNewUser
          ? `Bem-vindo! Você tem um convite para participar do projeto "${invite.projectTitle}" como ${getRoleLabel(invite.role)}`
          : `Você tem um convite pendente para o projeto "${invite.projectTitle}" como ${getRoleLabel(invite.role)}`;

        await setDoc(notificationRef, {
          id: notificationId,
          type: 'team_invitation',
          title: isNewUser ? 'Convite de Equipe - Bem-vindo!' : 'Convite para Equipe Pendente',
          message,
          userId,
          projectId: invite.projectId,
          invitationId: invite.id,
          isRead: false,
          priority: 'medium',
          createdAt: new Date().toISOString(),
          actionUrl: `/apk/team/invites/${invite.id}`,
          metadata: {
            invitedBy: invite.invitedByName,
            role: invite.role,
            projectTitle: invite.projectTitle
          }
        });

      }
    }
    return pendingInvites.length;
  } catch (error) {
    console.error('Erro ao verificar convites pendentes:', error);
    return 0;
  }
};
