import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { UserRole } from "@/types/collaboration";

export interface ProjectMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  projectId: string;
  joinedAt: string;
  isActive: boolean;
  lastActive?: string;
}

// Buscar membros de um projeto
export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  try {
    const membersRef = collection(db, 'project_members');
    const q = query(
      membersRef,
      where('projectId', '==', projectId)
    );

    const querySnapshot = await getDocs(q);
    const members: ProjectMember[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<ProjectMember, 'id'>;
      members.push({ ...data, id: doc.id });
    });

    // Ordenar por data de entrada (mais recentes primeiro)
    return members.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar membros do projeto:', error);
    return [];
  }
};

// Adicionar membro ao projeto
export const addProjectMember = async (
  projectId: string,
  userId: string,
  email: string,
  name: string,
  role: UserRole,
  avatar?: string
): Promise<boolean> => {
  try {
    const membersRef = collection(db, 'project_members');

    // Verificar se o usuário já é membro
    const existingQuery = query(
      membersRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    const existingDocs = await getDocs(existingQuery);
    if (!existingDocs.empty) {
      console.log('Usuário já é membro do projeto');
      return false;
    }

    const memberData: Omit<ProjectMember, 'id'> = {
      userId,
      email: email.toLowerCase(),
      name,
      avatar,
      role,
      projectId,
      joinedAt: new Date().toISOString(),
      isActive: true,
      lastActive: new Date().toISOString()
    };

    await addDoc(membersRef, memberData);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar membro ao projeto:', error);
    return false;
  }
};

// Atualizar role de um membro
export const updateMemberRole = async (
  memberId: string,
  newRole: UserRole
): Promise<boolean> => {
  try {
    const memberRef = doc(db, 'project_members', memberId);
    await updateDoc(memberRef, {
      role: newRole
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar role do membro:', error);
    return false;
  }
};

// Remover membro do projeto
export const removeMemberFromProject = async (memberId: string): Promise<boolean> => {
  try {
    const memberRef = doc(db, 'project_members', memberId);
    await deleteDoc(memberRef);
    return true;
  } catch (error) {
    console.error('Erro ao remover membro do projeto:', error);
    return false;
  }
};

// Atualizar última atividade do membro
export const updateMemberActivity = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  try {
    const membersRef = collection(db, 'project_members');
    const q = query(
      membersRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const memberDoc = querySnapshot.docs[0];
      const memberRef = doc(db, 'project_members', memberDoc.id);

      await updateDoc(memberRef, {
        lastActive: new Date().toISOString(),
        isActive: true
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao atualizar atividade do membro:', error);
    return false;
  }
};

// Verificar se usuário é membro do projeto
export const isUserProjectMember = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  try {
    const membersRef = collection(db, 'project_members');
    const q = query(
      membersRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar se usuário é membro:', error);
    return false;
  }
};

// Obter role do usuário no projeto
export const getUserProjectRole = async (
  projectId: string,
  userId: string
): Promise<UserRole | null> => {
  try {
    const membersRef = collection(db, 'project_members');
    const q = query(
      membersRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const memberData = querySnapshot.docs[0].data() as ProjectMember;
      return memberData.role;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter role do usuário:', error);
    return null;
  }
};
