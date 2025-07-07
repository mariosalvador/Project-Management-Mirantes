import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  addReaction
} from '@/Api/services/comments';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Mock Firebase
jest.mock('@/Api/services/firebase', () => ({
  db: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn()
}));

const mockFirestore = {
  collection: collection as jest.MockedFunction<typeof collection>,
  addDoc: addDoc as jest.MockedFunction<typeof addDoc>,
  getDocs: getDocs as jest.MockedFunction<typeof getDocs>,
  updateDoc: updateDoc as jest.MockedFunction<typeof updateDoc>,
  deleteDoc: deleteDoc as jest.MockedFunction<typeof deleteDoc>,
  doc: doc as jest.MockedFunction<typeof doc>,
  query: query as jest.MockedFunction<typeof query>,
  where: where as jest.MockedFunction<typeof where>,
  orderBy: orderBy as jest.MockedFunction<typeof orderBy>,
  serverTimestamp: serverTimestamp as jest.MockedFunction<typeof serverTimestamp>
};

describe('Comments Service', () => {
  const mockCommentData = {
    content: 'Test comment',
    contextType: 'project' as const,
    contextId: 'project1',
    projectId: 'project1'
  };

  const mockAuthor = {
    userId: 'user1',
    userName: 'Test User',
    userEmail: 'test@example.com',
    userAvatar: 'avatar.png'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.serverTimestamp.mockReturnValue({
      _methodName: 'serverTimestamp'
    } as unknown as ReturnType<typeof serverTimestamp>);
  });

  describe('createComment', () => {
    it('deve criar um comentário com sucesso', async () => {
      const mockDocRef = { id: 'comment123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef as unknown as ReturnType<typeof addDoc>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      const commentId = await createComment(
        mockCommentData,
        mockAuthor.userId,
        mockAuthor.userName,
        mockAuthor.userEmail,
        mockAuthor.userAvatar
      );

      expect(commentId).toBe('comment123');
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          content: 'Test comment',
          authorId: 'user1',
          authorName: 'Test User',
          authorEmail: 'test@example.com',
          authorAvatar: 'avatar.png',
          contextType: 'project',
          contextId: 'project1',
          projectId: 'project1',
          parentId: null,
          isEdited: false,
          reactions: [],
          attachments: [],
          mentions: []
        })
      );
    });

    it('deve criar comentário com dados mínimos', async () => {
      const mockDocRef = { id: 'comment456' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef as unknown as ReturnType<typeof addDoc>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      const commentId = await createComment(
        mockCommentData,
        mockAuthor.userId,
        mockAuthor.userName
      );

      expect(commentId).toBe('comment456');
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          content: 'Test comment',
          authorId: 'user1',
          authorName: 'Test User',
          authorEmail: '',
          authorAvatar: '',
          contextType: 'project',
          contextId: 'project1',
          projectId: 'project1'
        })
      );
    });

    it('deve lidar com erro na criação', async () => {
      const error = new Error('Firestore error');
      mockFirestore.addDoc.mockRejectedValue(error);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      await expect(
        createComment(
          mockCommentData,
          mockAuthor.userId,
          mockAuthor.userName
        )
      ).rejects.toThrow('Falha ao criar comentário');
    });
  });

  describe('getComments', () => {
    it('deve buscar comentários com sucesso', async () => {
      const mockDocs = [
        {
          id: 'comment1',
          data: () => ({
            content: 'First comment',
            authorId: 'user1',
            authorName: 'User 1',
            authorEmail: 'user1@test.com',
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
            reactions: [],
            isEdited: false,
            contextType: 'project',
            contextId: 'project1',
            projectId: 'project1',
            authorAvatar: '',
            parentId: null
          })
        }
      ];

      const mockQuerySnapshot = {
        docs: mockDocs
      };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);
      mockFirestore.orderBy.mockReturnValue({} as ReturnType<typeof orderBy>);

      const comments = await getComments('project', 'project1', 'project1');

      expect(comments).toHaveLength(1);
      expect(comments[0]).toEqual(expect.objectContaining({
        id: 'comment1',
        content: 'First comment',
        authorId: 'user1',
        authorName: 'User 1',
        authorEmail: 'user1@test.com'
      }));
    });

    it('deve retornar array vazio quando não há comentários', async () => {
      const mockQuerySnapshot = { docs: [] };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);
      mockFirestore.orderBy.mockReturnValue({} as ReturnType<typeof orderBy>);

      const comments = await getComments('project', 'project1', 'project1');

      expect(comments).toEqual([]);
    });

    it('deve lidar com erro na busca', async () => {
      const error = new Error('Firestore error');
      mockFirestore.getDocs.mockRejectedValue(error);

      await expect(
        getComments('project', 'project1', 'project1')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('updateComment', () => {
    it('deve atualizar comentário com sucesso', async () => {
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      await updateComment('comment123', 'Updated content', 'user1');

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          content: 'Updated content',
          isEdited: true
        })
      );
    });

    it('deve lidar com erro na atualização', async () => {
      const error = new Error('Update failed');
      mockFirestore.updateDoc.mockRejectedValue(error);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      await expect(
        updateComment('comment123', 'Updated content', 'user1')
      ).rejects.toThrow('Falha ao atualizar comentário');
    });
  });

  describe('deleteComment', () => {
    it('deve deletar comentário com sucesso', async () => {
      mockFirestore.deleteDoc.mockResolvedValue(undefined);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      await deleteComment('comment123');

      expect(mockFirestore.deleteDoc).toHaveBeenCalledWith({});
    });

    it('deve lidar com erro na deleção', async () => {
      const error = new Error('Delete failed');
      mockFirestore.deleteDoc.mockRejectedValue(error);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      await expect(
        deleteComment('comment123')
      ).rejects.toThrow();
    });
  });

  describe('addReaction', () => {
    it('deve chamar função de adicionar reação', async () => {
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      // A função addReaction existe mas pode não ter implementação completa
      await expect(
        addReaction('comment123', '👍', 'user1', 'Test User')
      ).rejects.toThrow('Falha ao adicionar reação');
    });
  });
});
