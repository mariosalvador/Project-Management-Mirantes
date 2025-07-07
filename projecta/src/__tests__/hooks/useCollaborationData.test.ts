import { renderHook, act, waitFor } from '@testing-library/react'
import { useCollaborationData } from '@/hooks/useCollaborationData'
import { useAuth } from '@/contexts/AuthContext'
import * as projectsService from '@/Api/services/projects'
import * as collaborationService from '@/Api/services/collaboration'

// Mock dos hooks e serviços
jest.mock('@/contexts/AuthContext')
jest.mock('@/Api/services/projects')
jest.mock('@/Api/services/collaboration')
jest.mock('sonner')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockGetUserProjectsAsMember = projectsService.getUserProjectsAsMember as jest.MockedFunction<typeof projectsService.getUserProjectsAsMember>
const mockUpdateTaskStatus = projectsService.updateTaskStatus as jest.MockedFunction<typeof projectsService.updateTaskStatus>
const mockDeleteTask = projectsService.deleteTask as jest.MockedFunction<typeof projectsService.deleteTask>

describe('useCollaborationData Hook', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User'
  }

  const mockProjects = [
    {
      id: 'project1',
      title: 'Project 1',
      status: 'active' as const,
      createdBy: 'user123',
      tasks: [
        {
          id: 'task1',
          title: 'Task 1',
          status: 'pending' as const,
          priority: 'medium' as const,
          assignees: ['test@example.com'],
          dueDate: '2025-08-15'
        },
        {
          id: 'task2',
          title: 'Task 2',
          status: 'completed' as const,
          priority: 'high' as const,
          assignees: ['other@example.com'],
          dueDate: '2025-08-20'
        }
      ],
      team: [
        { id: 'user123', name: 'Test User', role: 'admin', avatar: 'TU' }
      ],
      members: [
        {
          id: 'member1',
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
          projectId: 'project1',
          joinedAt: '2025-01-01',
          isActive: true
        }
      ],
      userRole: 'admin'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      userData: null,
      loading: false,
      isAuthenticated: true,
      logout: jest.fn()
    })
  })

  it('should initialize with default state', () => {
    mockGetUserProjectsAsMember.mockResolvedValue([])

    const { result } = renderHook(() => useCollaborationData())

    expect(result.current.userProjects).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.stats.totalProjects).toBe(0)
  })

  it('should load user projects on mount', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.userProjects).toHaveLength(1)
    expect(result.current.userProjects[0].title).toBe('Project 1')
  })

  it('should calculate stats correctly', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalProjects).toBe(1)
    expect(result.current.stats.activeProjects).toBe(1)
    expect(result.current.stats.totalTasks).toBe(2)
    expect(result.current.stats.completedTasks).toBe(1)
    expect(result.current.stats.activeTasks).toBe(0)
    expect(result.current.stats.pendingTasks).toBe(1)
  })

  it('should update task status successfully', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)
    mockUpdateTaskStatus.mockResolvedValue()

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateTaskStatus('project1', 'task1', 'active')
    })

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('project1', 'task1', 'active', 'user123')

    // Check local state update
    const updatedTask = result.current.userProjects[0].tasks?.find(t => t.id === 'task1')
    expect(updatedTask?.status).toBe('active')
  })

  it('should delete task successfully', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)
    mockDeleteTask.mockResolvedValue()

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteTask('project1', 'task1')
    })

    expect(mockDeleteTask).toHaveBeenCalledWith('project1', 'task1', 'user123')

    // Check local state update - task should be removed
    const remainingTasks = result.current.userProjects[0].tasks
    expect(remainingTasks?.some(t => t.id === 'task1')).toBe(false)
    expect(remainingTasks?.length).toBe(1)
  })

  it('should handle permission checks for task updates', async () => {
    const projectWithoutPermission = {
      ...mockProjects[0],
      userRole: 'viewer',
      tasks: [
        {
          id: 'task1',
          title: 'Task 1',
          status: 'pending' as const,
          priority: 'medium' as const,
          assignees: ['other@example.com'], // User is not assigned
          dueDate: '2025-08-15'
        }
      ]
    }

    mockGetUserProjectsAsMember.mockResolvedValue([projectWithoutPermission])

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateTaskStatus('project1', 'task1', 'active')
    })

    // Should not call the service due to permission check
    expect(mockUpdateTaskStatus).not.toHaveBeenCalled()
  })

  it('should filter tasks for specific user', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const userTasks = result.current.getTasksForUser('test@example.com')

    expect(userTasks).toHaveLength(1)
    expect(userTasks[0].id).toBe('task1')
  })

  it('should identify projects user can edit', async () => {
    mockGetUserProjectsAsMember.mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const editableProjects = result.current.getProjectsUserCanEdit()

    expect(editableProjects).toHaveLength(1)
    expect(editableProjects[0].userRole).toBe('admin')
  })

  it('should handle errors gracefully', async () => {
    mockGetUserProjectsAsMember.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Falha ao carregar dados de colaboração')
    expect(result.current.userProjects).toEqual([])
  })

  it('should refresh data when requested', async () => {
    mockGetUserProjectsAsMember
      .mockResolvedValueOnce(mockProjects)
      .mockResolvedValueOnce([])

    const { result } = renderHook(() => useCollaborationData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.userProjects).toHaveLength(1)

    await act(async () => {
      await result.current.refreshData()
    })

    expect(result.current.userProjects).toHaveLength(0)
    expect(mockGetUserProjectsAsMember).toHaveBeenCalledTimes(2)
  })
})
