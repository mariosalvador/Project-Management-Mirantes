/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  createProject,
  updateTaskStatus,
  deleteTask,
  //@ts-ignore
  getProjectById,
  getUserProjectsAsMember
} from '@/Api/services/projects'
import {
  addDoc,
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore'

// Mock do Firebase
jest.mock('@/Api/services/firebase', () => ({
  db: {},
}))

// Mock das funções do Firestore
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}))

describe('Projects Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const mockProjectData = {
        title: 'Test Project',
        description: 'Test Description',
        status: 'active' as const,
        priority: 'medium' as const,
        category: 'Development',
        manager: 'user123',
        startDate: '2025-01-01',
        dueDate: '2025-12-31',
        budget: '10000',
        team: [
          { id: 'user1', name: 'User 1', role: 'developer', avatar: 'U1' }
        ],
        tasks: [
          {
            id: 'task1',
            title: 'Test Task',
            status: 'pending' as const,
            priority: 'medium' as const,
            assignees: ['user1'],
            dueDate: '2025-08-15'
          }
        ],
        milestones: []
      }

      const mockDocRef = { id: 'project123' }
        ; (addDoc as jest.Mock).mockResolvedValue(mockDocRef)

      const projectId = await createProject(mockProjectData, 'user123')

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'Test Project',
          description: 'Test Description',
          createdBy: 'user123',
        })
      )
      expect(projectId).toBe('project123')
    })

    it('should handle empty team by adding test data', async () => {
      const mockProjectData = {
        title: 'Test Project',
        description: 'Test Description',
        status: 'active' as const,
        priority: 'medium' as const,
        category: 'Development',
        manager: 'user123',
        startDate: '2025-01-01',
        dueDate: '2025-12-31',
        budget: '10000',
        team: [], // Empty team
        tasks: [],
        milestones: []
      }

      const mockDocRef = { id: 'project123' }
        ; (addDoc as jest.Mock).mockResolvedValue(mockDocRef)

      await createProject(mockProjectData, 'user123')

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          team: expect.arrayContaining([
            expect.objectContaining({
              id: 'test-user-1',
              name: 'Usuário de Teste'
            })
          ])
        })
      )
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const mockProject = {
        id: 'project123',
        title: 'Test Project',
        team: [
          { id: 'user1', name: 'User 1', role: 'developer', avatar: 'U1' }
        ],
        tasks: [
          {
            id: 'task1',
            title: 'Test Task',
            status: 'pending',
            assignees: ['user1']
          }
        ]
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject
        })
        ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

      await updateTaskStatus('project123', 'task1', 'active', 'user123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'task1',
              status: 'active'
            })
          ])
        })
      )
    })

    it('should throw error if project not found', async () => {
      ; (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      await expect(
        updateTaskStatus('nonexistent', 'task1', 'active')
      ).rejects.toThrow('Projeto não encontrado')
    })

    it('should throw error if task not found', async () => {
      const mockProject = {
        id: 'project123',
        tasks: [
          { id: 'other-task', title: 'Other Task', status: 'pending' }
        ]
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject
        })

      await expect(
        updateTaskStatus('project123', 'nonexistent-task', 'active')
      ).rejects.toThrow('Tarefa não encontrada')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockProject = {
        id: 'project123',
        title: 'Test Project',
        team: [
          { id: 'user1', name: 'User 1', role: 'developer', avatar: 'U1' }
        ],
        tasks: [
          {
            id: 'task1',
            title: 'Task to Delete',
            status: 'pending',
            assignees: ['user1']
          },
          {
            id: 'task2',
            title: 'Task to Keep',
            status: 'active',
            assignees: ['user2']
          }
        ]
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject
        })
        ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

      await deleteTask('project123', 'task1', 'user123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tasks: expect.arrayContaining([
            expect.objectContaining({
              id: 'task2',
              title: 'Task to Keep'
            })
          ]),
          totalTasks: 1
        })
      )
    })

    it('should recalculate project statistics after deletion', async () => {
      const mockProject = {
        id: 'project123',
        title: 'Test Project',
        team: [],
        tasks: [
          {
            id: 'task1',
            title: 'Task to Delete',
            status: 'completed',
            assignees: ['user1']
          },
          {
            id: 'task2',
            title: 'Task to Keep',
            status: 'completed',
            assignees: ['user2']
          },
          {
            id: 'task3',
            title: 'Pending Task',
            status: 'pending',
            assignees: ['user1']
          }
        ]
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject
        })
        ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

      await deleteTask('project123', 'task1', 'user123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalTasks: 2,
          tasksCompleted: 1,
          progress: 50 // 1 completed out of 2 total = 50%
        })
      )
    })
  })

  describe('getProjectById', () => {
    it('should return project if exists and not archived', async () => {
      const mockProject = {
        id: 'project123',
        title: 'Test Project',
        isArchived: false
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject,
          id: 'project123'
        })

      const result = await getProjectById('project123')

      expect(result).toEqual(expect.objectContaining({
        id: 'project123',
        title: 'Test Project'
      }))
    })

    it('should return null if project is archived', async () => {
      const mockProject = {
        id: 'project123',
        title: 'Archived Project',
        isArchived: true
      }

        ; (getDoc as jest.Mock).mockResolvedValue({
          exists: () => true,
          data: () => mockProject
        })

      const result = await getProjectById('project123')

      expect(result).toBeNull()
    })

    it('should return null if project does not exist', async () => {
      ; (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      const result = await getProjectById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getUserProjectsAsMember', () => {
    it('should return projects where user is a member', async () => {
      const mockProjects = [
        {
          id: 'project1',
          title: 'Project 1',
          team: [
            { id: 'user123', name: 'Test User' }
          ],
          isArchived: false
        },
        {
          id: 'project2',
          title: 'Project 2',
          team: [
            { id: 'other-user', name: 'Other User' }
          ],
          isArchived: false
        }
      ]

        ; (getDocs as jest.Mock).mockResolvedValue({
          docs: mockProjects.map(project => ({
            id: project.id,
            data: () => project
          }))
        })

      const result = await getUserProjectsAsMember('user123')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'project1',
        title: 'Project 1'
      }))
    })

    it('should filter out archived projects', async () => {
      const mockProjects = [
        {
          id: 'project1',
          title: 'Active Project',
          team: [{ id: 'user123', name: 'Test User' }],
          isArchived: false
        },
        {
          id: 'project2',
          title: 'Archived Project',
          team: [{ id: 'user123', name: 'Test User' }],
          isArchived: true
        }
      ]

        ; (getDocs as jest.Mock).mockResolvedValue({
          docs: mockProjects.map(project => ({
            id: project.id,
            data: () => project
          }))
        })

      const result = await getUserProjectsAsMember('user123')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Active Project')
    })
  })
})
