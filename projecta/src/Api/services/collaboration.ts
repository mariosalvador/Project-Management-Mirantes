import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Comment,
  Reaction,
  UserRole,
  Activity
} from '@/types/collaboration';
import { Project } from '@/types/project';

export interface CollaborationData {
  id: string;
  contextId: string; 
  contextType: 'project' | 'task';
  contextTitle: string;
  membersIds: string[];
  comments: Comment[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CollaborationStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  myProgress: number;
  totalComments: number;
  totalActivities: number;
}

export interface UserProjectData extends Project {
  userRole?: UserRole;
  members: ProjectMember[];
  collaborationData?: CollaborationData;
}

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
  lastActivity?: string;
  permissions?: string[];
}

// === COLABORAÇÃO GERAL ===

/**
 * Busca dados de colaboração por contexto (projeto ou tarefa)
 */
export const getCollaborationData = async (
  contextId: string,
  contextType: 'project' | 'task'
): Promise<CollaborationData | null> => {
  try {
    const q = query(
      collection(db, 'collaborations'),
      where('contextId', '==', contextId),
      where('contextType', '==', contextType)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as CollaborationData;
  } catch (error) {
    console.error('Erro ao buscar dados de colaboração:', error);
    throw error;
  }
};

/**
 * Cria um novo contexto de colaboração
 */
export const createCollaborationContext = async (
  contextId: string,
  contextType: 'project' | 'task',
  contextTitle: string,
  membersIds: string[],
  createdBy: string
): Promise<string> => {
  try {
    const collaborationData: Omit<CollaborationData, 'id'> = {
      contextId,
      contextType,
      contextTitle,
      membersIds,
      comments: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy
    };

    const docRef = await addDoc(collection(db, 'collaborations'), collaborationData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar contexto de colaboração:', error);
    throw error;
  }
};

/**
 * Atualiza membros do contexto de colaboração
 */
export const updateCollaborationMembers = async (
  collaborationId: string,
  membersIds: string[]
): Promise<void> => {
  try {
    const docRef = doc(db, 'collaborations', collaborationId);
    await updateDoc(docRef, {
      membersIds,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar membros da colaboração:', error);
    throw error;
  }
};

// === COMENTÁRIOS ===

/**
 * Adiciona um comentário ao contexto de colaboração
 */
export const addComment = async (
  collaborationId: string,
  comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const newComment: Comment = {
      id: Date.now().toString(),
      content: comment.content,
      authorId: comment.authorId,
      authorName: comment.authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(comment.authorAvatar && { authorAvatar: comment.authorAvatar }),
      ...(comment.mentions && comment.mentions.length > 0 && { mentions: comment.mentions }),
      ...(comment.attachments && comment.attachments.length > 0 && { attachments: comment.attachments }),
      ...(comment.reactions && comment.reactions.length > 0 && { reactions: comment.reactions }),
      ...(comment.isEdited !== undefined && { isEdited: comment.isEdited }),
      ...(comment.parentId && { parentId: comment.parentId })
    };

    const docRef = doc(db, 'collaborations', collaborationId);
    await updateDoc(docRef, {
      comments: arrayUnion(newComment),
      updatedAt: serverTimestamp()
    });

    return newComment.id;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
};

/**
 * Atualiza um comentário existente
 */
export const updateComment = async (
  collaborationId: string,
  commentId: string,
  content: string
): Promise<void> => {
  try {
    // Buscar os dados atuais
    const docRef = doc(db, 'collaborations', collaborationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Contexto de colaboração não encontrado');
    }

    const data = docSnap.data() as CollaborationData;
    const updatedComments = data.comments.map(comment =>
      comment.id === commentId
        ? {
          ...comment,
          content,
          updatedAt: new Date().toISOString(),
          isEdited: true
        }
        : comment
    );

    await updateDoc(docRef, {
      comments: updatedComments,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    throw error;
  }
};

/**
 * Remove um comentário
 */
export const deleteComment = async (
  collaborationId: string,
  commentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'collaborations', collaborationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Contexto de colaboração não encontrado');
    }

    const data = docSnap.data() as CollaborationData;
    const filteredComments = data.comments.filter(comment => comment.id !== commentId);

    await updateDoc(docRef, {
      comments: filteredComments,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao remover comentário:', error);
    throw error;
  }
};

/**
 * Adiciona reação a um comentário
 */
export const addReactionToComment = async (
  collaborationId: string,
  commentId: string,
  reaction: Reaction
): Promise<void> => {
  try {
    const docRef = doc(db, 'collaborations', collaborationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Contexto de colaboração não encontrado');
    }

    const data = docSnap.data() as CollaborationData;
    const updatedComments = data.comments.map(comment => {
      if (comment.id === commentId) {
        const existingReactions = comment.reactions || [];
        const existingReactionIndex = existingReactions.findIndex(
          r => r.userId === reaction.userId && r.emoji === reaction.emoji
        );

        if (existingReactionIndex > -1) {
          // Remove a reação se já existir
          existingReactions.splice(existingReactionIndex, 1);
        } else {
          // Adiciona nova reação
          existingReactions.push(reaction);
        }

        return { ...comment, reactions: existingReactions };
      }
      return comment;
    });

    await updateDoc(docRef, {
      comments: updatedComments,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao adicionar reação:', error);
    throw error;
  }
};

// === ATIVIDADES ===

/**
 * Adiciona uma atividade ao feed
 */
export const addActivity = async (
  collaborationId: string,
  activity: Omit<Activity, 'id'>
): Promise<string> => {
  try {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString()
    };

    const docRef = doc(db, 'collaborations', collaborationId);
    await updateDoc(docRef, {
      activities: arrayUnion(newActivity),
      updatedAt: serverTimestamp()
    });

    return newActivity.id;
  } catch (error) {
    console.error('Erro ao adicionar atividade:', error);
    throw error;
  }
};

/**
 * Busca atividades recentes do usuário
 */
export const getUserRecentActivities = async (
  userId: string,
  limitCount: number = 20
): Promise<Activity[]> => {
  try {
    const q = query(
      collection(db, 'collaborations'),
      where('membersIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as CollaborationData;
      activities.push(...data.activities);
    });

    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Erro ao buscar atividades do usuário:', error);
    throw error;
  }
};

// === MEMBROS DE PROJETO ===

/**
 * Busca membros de um projeto
 */
export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  try {
    const q = query(
      collection(db, 'projectMembers'),
      where('projectId', '==', projectId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const members: ProjectMember[] = [];

    querySnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data()
      } as ProjectMember);
    });

    return members;
  } catch (error) {
    console.error('Erro ao buscar membros do projeto:', error);
    throw error;
  }
};

/**
 * Adiciona membro ao projeto
 */
export const addProjectMember = async (
  projectId: string,
  userId: string,
  email: string,
  name: string,
  role: UserRole,
  addedBy: string
): Promise<string> => {
  try {
    const memberData: Omit<ProjectMember, 'id'> = {
      userId,
      email,
      name,
      role,
      projectId,
      joinedAt: new Date().toISOString(),
      isActive: true,
      permissions: []
    };

    const docRef = await addDoc(collection(db, 'projectMembers'), memberData);

    // Adicionar atividade
    const collaborationData = await getCollaborationData(projectId, 'project');
    if (collaborationData) {
      await addActivity(collaborationData.id, {
        type: 'user_added',
        userId: addedBy,
        userName: 'Sistema',
        description: `${name} foi adicionado ao projeto`,
        targetType: 'project',
        targetId: projectId,
        targetName: 'Projeto',
        createdAt: new Date().toISOString(),
        metadata: { memberId: userId, memberName: name }
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar membro ao projeto:', error);
    throw error;
  }
};

/**
 * Remove membro do projeto
 */
export const removeProjectMember = async (
  projectId: string,
  userId: string,
  removedBy: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, 'projectMembers'),
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data() as ProjectMember;

      await updateDoc(memberDoc.ref, {
        isActive: false,
        leftAt: new Date().toISOString()
      });

      // Adicionar atividade
      const collaborationData = await getCollaborationData(projectId, 'project');
      if (collaborationData) {
        await addActivity(collaborationData.id, {
          type: 'user_removed',
          userId: removedBy,
          userName: 'Sistema',
          description: `${memberData.name} foi removido do projeto`,
          targetType: 'project',
          targetId: projectId,
          targetName: 'Projeto',
          createdAt: new Date().toISOString(),
          metadata: { memberId: userId, memberName: memberData.name }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao remover membro do projeto:', error);
    throw error;
  }
};

// === ESTATÍSTICAS ===

/**
 * Calcula estatísticas de colaboração para um usuário
 */
export const getUserCollaborationStats = async (userId: string): Promise<CollaborationStats> => {
  try {
    // Buscar projetos do usuário
    const projectMembersQuery = query(
      collection(db, 'projectMembers'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const projectMembersSnapshot = await getDocs(projectMembersQuery);
    const projectIds = projectMembersSnapshot.docs.map(doc => doc.data().projectId);

    if (projectIds.length === 0) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        myProgress: 0,
        totalComments: 0,
        totalActivities: 0
      };
    }

    // Buscar projetos
    const projectsQuery = query(
      collection(db, 'projects'),
      where('__name__', 'in', projectIds)
    );

    const projectsSnapshot = await getDocs(projectsQuery);
    const projects: Project[] = [];
    projectsSnapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });

    // Calcular estatísticas
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: 0,
      activeTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      myProgress: 0,
      totalComments: 0,
      totalActivities: 0
    };

    const now = new Date();
    let userTasks = 0;
    let userCompletedTasks = 0;

    // Processar tarefas de cada projeto
    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          stats.totalTasks++;

          if (task.status === 'active') stats.activeTasks++;
          else if (task.status === 'completed') stats.completedTasks++;
          else stats.pendingTasks++;

          // Verificar se está atrasada
          if (task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < now) {
            stats.overdueTasks++;
          }

          // Tarefas do usuário
          if (task.assignees.includes(userId)) {
            userTasks++;
            if (task.status === 'completed') {
              userCompletedTasks++;
            }
          }
        });
      }
    });

    stats.myProgress = userTasks > 0 ? Math.round((userCompletedTasks / userTasks) * 100) : 0;

    // Buscar estatísticas de colaboração
    const collaborationQuery = query(
      collection(db, 'collaborations'),
      where('membersIds', 'array-contains', userId)
    );

    const collaborationSnapshot = await getDocs(collaborationQuery);
    collaborationSnapshot.forEach(doc => {
      const data = doc.data() as CollaborationData;
      stats.totalComments += data.comments?.length || 0;
      stats.totalActivities += data.activities?.length || 0;
    });

    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas de colaboração:', error);
    throw error;
  }
};

// === LISTENERS EM TEMPO REAL ===

/**
 * Escuta mudanças em tempo real nos dados de colaboração
 */
export const subscribeToCollaboration = (
  contextId: string,
  contextType: 'project' | 'task',
  callback: (data: CollaborationData | null) => void
) => {
  const q = query(
    collection(db, 'collaborations'),
    where('contextId', '==', contextId),
    where('contextType', '==', contextType)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const doc = snapshot.docs[0];
    const data = {
      id: doc.id,
      ...doc.data()
    } as CollaborationData;

    callback(data);
  }, (error) => {
    console.error('Erro no listener de colaboração:', error);
  });
};

/**
 * Escuta mudanças nos membros do projeto
 */
export const subscribeToProjectMembers = (
  projectId: string,
  callback: (members: ProjectMember[]) => void
) => {
  const q = query(
    collection(db, 'projectMembers'),
    where('projectId', '==', projectId),
    where('isActive', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const members: ProjectMember[] = [];
    snapshot.forEach(doc => {
      members.push({
        id: doc.id,
        ...doc.data()
      } as ProjectMember);
    });

    callback(members);
  }, (error) => {
    console.error('Erro no listener de membros do projeto:', error);
  });
};
