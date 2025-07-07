import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  notifyTaskStatusChange,
  notifyProjectUpdate,
  notifyInviteAccepted
} from '@/Api/services/notifications'
import { setDoc, getDocs, updateDoc } from 'firebase/firestore'

// Mock do Firebase
jest.mock('@/Api/services/firebase', () => ({
  db: {},
}))

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockNotificationData = {
        type: 'task_status_change' as const,
        title: 'Status Alterado',
        message: 'A tarefa foi atualizada',
        userId: 'user123',
        projectId: 'project123',
        taskId: 'task123',
        isRead: false,
        priority: 'medium' as const,
        metadata: {
          oldStatus: 'pending',
          newStatus: 'active'
        }
      }

        ; (setDoc as jest.Mock).mockResolvedValue(undefined)

      const notificationId = await createNotification(mockNotificationData)

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'task_status_change',
          title: 'Status Alterado',
          userId: 'user123',
          isRead: false,
          id: expect.any(String),
          createdAt: expect.any(String)
        })
      )
      expect(notificationId).toMatch(/^task_status_change_\d+_[a-z0-9]+$/)
    })

    it('should handle notification creation errors', async () => {
      const mockNotificationData = {
        type: 'task_deadline' as const,
        title: 'Prazo Próximo',
        message: 'Tarefa vence em breve',
        userId: 'user123',
        projectId: 'project123',
        isRead: false,
        priority: 'high' as const
      }

        ; (setDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      await expect(createNotification(mockNotificationData)).rejects.toThrow('Firestore error')
    })
  })

  describe('getUserNotifications', () => {
    it('should return user notifications sorted by date', async () => {
      const mockNotifications = [
        {
          id: 'notif1',
          type: 'task_status_change',
          title: 'Notification 1',
          createdAt: '2025-01-01T10:00:00Z',
          userId: 'user123'
        },
        {
          id: 'notif2',
          type: 'project_update',
          title: 'Notification 2',
          createdAt: '2025-01-02T10:00:00Z',
          userId: 'user123'
        }
      ]

        ; (getDocs as jest.Mock).mockResolvedValue({
          forEach: (callback: any) => {
            mockNotifications.forEach(notification => {
              callback({
                id: notification.id,
                data: () => notification
              })
            })
          }
        })

      const result = await getUserNotifications('user123')

      expect(result).toHaveLength(2)
      expect(result[0].createdAt).toBe('2025-01-02T10:00:00Z') // Most recent first
      expect(result[1].createdAt).toBe('2025-01-01T10:00:00Z')
    })

    it('should return empty array on error', async () => {
      ; (getDocs as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getUserNotifications('user123')

      expect(result).toEqual([])
    })
  })

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      ; (updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await markNotificationAsRead('notif123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { isRead: true }
      )
      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      ; (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'))

      const result = await markNotificationAsRead('notif123')

      expect(result).toBe(false)
    })
  })

  describe('notifyTaskStatusChange', () => {
    it('should send notifications to relevant users', async () => {
      ; (setDoc as jest.Mock).mockResolvedValue(undefined)

      await notifyTaskStatusChange(
        'task123',
        'Test Task',
        'project123',
        'Test Project',
        'pending',
        'completed',
        'user123',
        ['user456', 'user789'], // team members
        ['user456'] // assignees
      )

      // Should create notifications for unique users (excluding the user who made the change)
      expect(setDoc).toHaveBeenCalledTimes(2) // user456 and user789
    })

    it('should not notify the user who made the change', async () => {
      ; (setDoc as jest.Mock).mockResolvedValue(undefined)

      await notifyTaskStatusChange(
        'task123',
        'Test Task',
        'project123',
        'Test Project',
        'pending',
        'completed',
        'user123',
        ['user123', 'user456'], // team members (includes the changer)
        ['user123'] // assignees (includes the changer)
      )

      // Should only create notification for user456
      expect(setDoc).toHaveBeenCalledTimes(1)
    })
  })

  describe('notifyProjectUpdate', () => {
    it('should send project update notifications', async () => {
      ; (setDoc as jest.Mock).mockResolvedValue(undefined)

      await notifyProjectUpdate(
        'project123',
        'Test Project',
        'criação',
        'Projeto foi criado',
        'user123',
        ['user456', 'user789']
      )

      expect(setDoc).toHaveBeenCalledTimes(2)
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'project_update',
          title: 'Atualização de Projeto',
          message: 'Projeto foi criado',
          projectId: 'project123'
        })
      )
    })

    it('should handle errors gracefully', async () => {
      ; (setDoc as jest.Mock).mockRejectedValue(new Error('Network error'))

      // Should not throw
      await expect(
        notifyProjectUpdate(
          'project123',
          'Test Project',
          'atualização',
          'Projeto foi atualizado',
          'user123',
          ['user456']
        )
      ).resolves.toBeUndefined()
    })
  })

  describe('notifyInviteAccepted', () => {
    it('should notify inviter when invite is accepted', async () => {
      ; (setDoc as jest.Mock).mockResolvedValue(undefined)

      await notifyInviteAccepted(
        'user123', // inviter
        'project123',
        'Test Project',
        'John Doe',
        'john@example.com',
        'invite123'
      )

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'invite_accepted',
          title: 'Convite Aceito',
          userId: 'user123',
          projectId: 'project123',
          priority: 'medium',
          metadata: expect.objectContaining({
            acceptedBy: 'John Doe',
            acceptedByEmail: 'john@example.com',
            inviteId: 'invite123'
          })
        })
      )
    })
  })
})
