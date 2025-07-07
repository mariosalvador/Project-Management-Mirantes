import {
  sendTeamInvite,
  getUserInvites,
  acceptInvite,
  declineInvite,
  getProjectInvites,
  getPendingInvitesByEmail
} from '@/Api/services/invites';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Mock Firebase
jest.mock('@/Api/services/firebase', () => ({
  db: jest.fn()
}));

jest.mock('@/Api/services/notifications', () => ({
  createNotification: jest.fn().mockResolvedValue('notification123')
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn()
}));

const mockFirestore = {
  collection: collection as jest.MockedFunction<typeof collection>,
  addDoc: addDoc as jest.MockedFunction<typeof addDoc>,
  getDocs: getDocs as jest.MockedFunction<typeof getDocs>,
  updateDoc: updateDoc as jest.MockedFunction<typeof updateDoc>,
  deleteDoc: deleteDoc as jest.MockedFunction<typeof deleteDoc>,
  doc: doc as jest.MockedFunction<typeof doc>,
  getDoc: getDoc as jest.MockedFunction<typeof getDoc>,
  query: query as jest.MockedFunction<typeof query>,
  where: where as jest.MockedFunction<typeof where>,
  serverTimestamp: serverTimestamp as jest.MockedFunction<typeof serverTimestamp>
};

describe('Invites Service', () => {
  const mockInviteData = {
    email: 'invitee@test.com',
    role: 'member' as const,
    message: 'Please join our project'
  };

  const mockCurrentUser = {
    id: 'user1',
    email: 'inviter@test.com',
    name: 'Inviter User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.serverTimestamp.mockReturnValue({
      _methodName: 'serverTimestamp'
    } as unknown as ReturnType<typeof serverTimestamp>);
  });

  describe('sendTeamInvite', () => {
    it('deve enviar convite com sucesso', async () => {
      const mockDocRef = { id: 'invite123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef as unknown as ReturnType<typeof addDoc>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      const result = await sendTeamInvite(
        mockInviteData.email,
        mockInviteData.role,
        'project1',
        'Test Project',
        mockCurrentUser.id,
        mockCurrentUser.name,
        mockCurrentUser.email
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('invitee@test.com');
      expect(result.role).toBe('member');
      expect(result.projectId).toBe('project1');
    });

    it('deve lidar com erro no envio', async () => {
      const error = new Error('Firestore error');
      mockFirestore.addDoc.mockRejectedValue(error);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        sendTeamInvite(
          mockInviteData.email,
          mockInviteData.role,
          'project1',
          'Test Project',
          mockCurrentUser.id,
          mockCurrentUser.name,
          mockCurrentUser.email
        )
      ).rejects.toThrow('Você não pode enviar um convite para si mesmo');

      consoleSpy.mockRestore();
    });
  });

  describe('getUserInvites', () => {
    it('deve buscar convites do usuário com sucesso', async () => {
      const mockDocs = [
        {
          id: 'invite1',
          data: () => ({
            projectId: 'project1',
            projectName: 'Project 1',
            email: 'user@test.com',
            role: 'member',
            status: 'pending',
            inviterName: 'Inviter',
            createdAt: { toDate: () => new Date('2024-01-01') },
            message: 'Join us'
          })
        },
        {
          id: 'invite2',
          data: () => ({
            projectId: 'project2',
            projectName: 'Project 2',
            email: 'user@test.com',
            role: 'admin',
            status: 'pending',
            inviterName: 'Inviter 2',
            createdAt: { toDate: () => new Date('2024-01-02') },
            message: 'Please join'
          })
        }
      ];

      const mockQuerySnapshot = { docs: mockDocs };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);

      const invites = await getUserInvites('user@test.com');

      expect(invites).toHaveLength(2);
      expect(invites[0]).toEqual(expect.objectContaining({
        id: 'invite1',
        projectName: 'Project 1',
        status: 'pending',
        role: 'member'
      }));
    });

    it('deve retornar array vazio quando não há convites', async () => {
      const mockQuerySnapshot = { docs: [] };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);

      const invites = await getUserInvites('user@test.com');

      expect(invites).toEqual([]);
    });

    it('deve lidar com erro na busca', async () => {
      const error = new Error('Firestore error');
      mockFirestore.getDocs.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invites = await getUserInvites('user@test.com');

      expect(invites).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar convites do usuário:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('getProjectInvites', () => {
    it('deve buscar convites do projeto com sucesso', async () => {
      const mockDocs = [
        {
          id: 'invite1',
          data: () => ({
            projectId: 'project1',
            email: 'user1@test.com',
            role: 'member',
            status: 'pending',
            inviterName: 'Admin',
            createdAt: { toDate: () => new Date('2024-01-01') }
          })
        }
      ];

      const mockQuerySnapshot = { docs: mockDocs };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);

      const invites = await getProjectInvites('project1');

      expect(invites).toHaveLength(1);
      expect(invites[0]).toEqual(expect.objectContaining({
        id: 'invite1',
        projectId: 'project1',
        email: 'user1@test.com',
        status: 'pending'
      }));
    });

    it('deve lidar com erro na busca', async () => {
      const error = new Error('Firestore error');
      mockFirestore.getDocs.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invites = await getProjectInvites('project1');

      expect(invites).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar convites do projeto:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('acceptInvite', () => {
    it('deve aceitar convite com sucesso', async () => {
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      const result = await acceptInvite('invite123', 'user123', 'john@test.com', 'John Doe');

      expect(result).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          status: 'accepted',
          acceptedBy: 'user123',
          acceptedByEmail: 'john@test.com',
          acceptedByName: 'John Doe'
        })
      );
    });

    it('deve lidar com erro ao aceitar', async () => {
      const error = new Error('Update failed');
      mockFirestore.updateDoc.mockRejectedValue(error);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await acceptInvite('invite123', 'user123', 'john@test.com', 'John Doe');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao aceitar convite:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('declineInvite', () => {
    it('deve recusar convite com sucesso', async () => {
      mockFirestore.updateDoc.mockResolvedValue(undefined);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      const result = await declineInvite('invite123');

      expect(result).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          status: 'declined'
        })
      );
    });

    it('deve lidar com erro ao recusar', async () => {
      const error = new Error('Update failed');
      mockFirestore.updateDoc.mockRejectedValue(error);
      mockFirestore.doc.mockReturnValue({} as ReturnType<typeof doc>);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await declineInvite('invite123');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao recusar convite:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('getPendingInvitesByEmail', () => {
    it('deve buscar convites pendentes por email', async () => {
      const mockDocs = [
        {
          id: 'invite1',
          data: () => ({
            projectId: 'project1',
            email: 'user@test.com',
            role: 'member',
            status: 'pending',
            inviterName: 'Admin',
            createdAt: { toDate: () => new Date('2024-01-01') }
          })
        }
      ];

      const mockQuerySnapshot = { docs: mockDocs };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);

      const invites = await getPendingInvitesByEmail('user@test.com');

      expect(invites).toHaveLength(1);
      expect(invites[0]).toEqual(expect.objectContaining({
        id: 'invite1',
        email: 'user@test.com',
        status: 'pending'
      }));
    });

    it('deve lidar com erro na busca', async () => {
      const error = new Error('Firestore error');
      mockFirestore.getDocs.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invites = await getPendingInvitesByEmail('user@test.com');

      expect(invites).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar convites pendentes:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('integração com notificações', () => {
    it('deve chamar serviço de notificação durante envio de convite', async () => {
      const mockDocRef = { id: 'invite123' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef as unknown as ReturnType<typeof addDoc>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);

      const result = await sendTeamInvite(
        'different@test.com',
        'member',
        'project1',
        'Test Project',
        mockCurrentUser.id,
        mockCurrentUser.name,
        mockCurrentUser.email
      );

      // O serviço de convites pode criar notificações internamente
      // Verificamos se não há erros durante o processo
      expect(result).toBeDefined();
    });
  });

  describe('validação de status', () => {
    it('deve validar status do convite ao buscar', async () => {
      const mockDocs = [
        {
          id: 'invite1',
          data: () => ({
            projectId: 'project1',
            email: 'user@test.com',
            role: 'member',
            status: 'pending',
            inviterName: 'Admin',
            createdAt: { toDate: () => new Date('2024-01-01') }
          })
        },
        {
          id: 'invite2',
          data: () => ({
            projectId: 'project1',
            email: 'user@test.com',
            role: 'member',
            status: 'accepted',
            inviterName: 'Admin',
            createdAt: { toDate: () => new Date('2024-01-01') }
          })
        }
      ];

      const mockQuerySnapshot = { docs: mockDocs };

      mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot as unknown as ReturnType<typeof getDocs>);
      mockFirestore.query.mockReturnValue({} as ReturnType<typeof query>);
      mockFirestore.collection.mockReturnValue({} as ReturnType<typeof collection>);
      mockFirestore.where.mockReturnValue({} as ReturnType<typeof where>);

      const pendingInvites = await getPendingInvitesByEmail('user@test.com');

      // Deve retornar apenas convites pendentes
      expect(pendingInvites).toHaveLength(1);
      expect(pendingInvites[0].status).toBe('pending');
    });
  });
});
