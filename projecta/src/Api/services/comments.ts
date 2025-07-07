/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Comment, CommentFormData } from "@/types/comments";

const COMMENTS_COLLECTION = "comments";

// Criar um novo comentário
export const createComment = async (
  commentData: CommentFormData,
  userId: string,
  userName: string,
  userEmail?: string,
  userAvatar?: string
): Promise<string> => {
  try {
    const now = serverTimestamp();

    const newComment = {
      content: commentData.content,
      authorId: userId,
      authorName: userName,
      authorEmail: userEmail || '',
      authorAvatar: userAvatar || '',
      contextType: commentData.contextType,
      contextId: commentData.contextId,
      projectId: commentData.projectId,
      parentId: commentData.parentId || null,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
      reactions: [],
      attachments: [],
      mentions: []
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), newComment);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    throw new Error("Falha ao criar comentário");
  }
};

// Buscar comentários de um contexto específico (projeto ou tarefa)
export const getComments = async (
  contextType: 'project' | 'task',
  contextId: string,
  projectId: string
): Promise<Comment[]> => {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("contextType", "==", contextType),
      where("contextId", "==", contextId),
      where("projectId", "==", projectId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = [];

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();

      // Converter timestamps do Firestore para strings
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;

      const updatedAt = data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt;

      comments.push({
        id: doc.id,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorAvatar: data.authorAvatar,
        contextType: data.contextType,
        contextId: data.contextId,
        projectId: data.projectId,
        parentId: data.parentId,
        createdAt,
        updatedAt,
        isEdited: data.isEdited || false,
        reactions: data.reactions || [],
        attachments: data.attachments || [],
        mentions: data.mentions || []
      });
    });
    return comments;
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw new Error("Falha ao buscar comentários");
  }
};

// Buscar respostas de um comentário específico
export const getReplies = async (parentCommentId: string): Promise<Comment[]> => {
  try {
    const repliesQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("parentId", "==", parentCommentId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(repliesQuery);
    const replies: Comment[] = [];

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();

      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;

      const updatedAt = data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt;

      replies.push({
        id: doc.id,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorAvatar: data.authorAvatar,
        contextType: data.contextType,
        contextId: data.contextId,
        projectId: data.projectId,
        parentId: data.parentId,
        createdAt,
        updatedAt,
        isEdited: data.isEdited || false,
        reactions: data.reactions || [],
        attachments: data.attachments || [],
        mentions: data.mentions || []
      });
    });

    return replies;
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    throw new Error("Falha ao buscar respostas");
  }
};

// Atualizar um comentário
export const updateComment = async (
  commentId: string,
  newContent: string,
  userId: string
): Promise<void> => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);

    await updateDoc(commentRef, {
      content: newContent,
      updatedAt: serverTimestamp(),
      isEdited: true
    });

  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    throw new Error("Falha ao atualizar comentário");
  }
};

// Deletar um comentário
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw new Error("Falha ao deletar comentário");
  }
};

// Adicionar reação a um comentário
export const addReaction = async (
  commentId: string,
  emoji: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
  } catch (error) {
    console.error("Erro ao adicionar reação:", error);
    throw new Error("Falha ao adicionar reação");
  }
};

// Buscar todos os comentários de um projeto (para estatísticas)
export const getProjectComments = async (projectId: string): Promise<Comment[]> => {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = [];

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();

      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;

      comments.push({
        id: doc.id,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorAvatar: data.authorAvatar,
        contextType: data.contextType,
        contextId: data.contextId,
        projectId: data.projectId,
        parentId: data.parentId,
        createdAt,
        updatedAt: data.updatedAt,
        isEdited: data.isEdited || false,
        reactions: data.reactions || [],
        attachments: data.attachments || [],
        mentions: data.mentions || []
      });
    });

    return comments;
  } catch (error) {
    console.error("Erro ao buscar comentários do projeto:", error);
    throw new Error("Falha ao buscar comentários do projeto");
  }
};
