import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Project } from "@/types/project";
import { notifyTaskDeadlineApproaching, notifyOverdueTask } from "./notifications";

// Verificar tarefas próximas do prazo e em atraso
export const checkTaskDeadlines = async (): Promise<void> => {
  try {
    const projectsRef = collection(db, 'projects');
    const projectQuery = query(projectsRef, where('isArchived', '==', false));
    const projectSnapshot = await getDocs(projectQuery);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    let tasksChecked = 0;
    let notificationsSent = 0;

    for (const projectDoc of projectSnapshot.docs) {
      const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

      if (!project.tasks || !Array.isArray(project.tasks)) {
        continue;
      }

      for (const task of project.tasks) {
        if (task.status === 'completed') {
          continue;
        }

        if (!task.dueDate || !task.assignees || task.assignees.length === 0) {
          continue;
        }

        tasksChecked++;
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const assigneeIds = task.assignees;

        // Tarefa em atraso
        if (dueDate < now) {
          const daysOverdue = Math.abs(daysDiff);

          await notifyOverdueTask(
            task.id,
            task.title,
            project.id,
            project.title,
            task.dueDate,
            daysOverdue,
            assigneeIds
          );
          notificationsSent++;
        }
        // Tarefa próxima do prazo (1-3 dias)
        else if (daysDiff <= 3 && daysDiff > 0) {
          await notifyTaskDeadlineApproaching(
            task.id,
            task.title,
            project.id,
            project.title,
            task.dueDate,
            daysDiff,
            assigneeIds
          );
          notificationsSent++;
        }
      }
    }

    console.log(`Verificação de prazos concluída: ${tasksChecked} tarefas verificadas, ${notificationsSent} notificações enviadas`);
  } catch (error) {
    console.error('Erro ao verificar prazos de tarefas:', error);
  }
};

// Verificar tarefas de um projeto específico
export const checkProjectTaskDeadlines = async (projectId: string): Promise<void> => {
  try {
    const projectRef = collection(db, 'projects');
    const projectQuery = query(projectRef, where('__name__', '==', projectId));
    const projectSnapshot = await getDocs(projectQuery);

    if (projectSnapshot.empty) {
      return;
    }

    const project = { id: projectSnapshot.docs[0].id, ...projectSnapshot.docs[0].data() } as Project;

    if (!project.tasks || !Array.isArray(project.tasks)) {
      return;
    }

    const now = new Date();

    for (const task of project.tasks) {
      if (task.status === 'completed' || !task.dueDate || !task.assignees || task.assignees.length === 0) {
        continue;
      }

      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      const assigneeIds = task.assignees;

      if (dueDate < now) {
        const daysOverdue = Math.abs(daysDiff);
        await notifyOverdueTask(
          task.id,
          task.title,
          project.id,
          project.title,
          task.dueDate,
          daysOverdue,
          assigneeIds
        );
      } else if (daysDiff <= 3 && daysDiff > 0) {
        await notifyTaskDeadlineApproaching(
          task.id,
          task.title,
          project.id,
          project.title,
          task.dueDate,
          daysDiff,
          assigneeIds
        );
      }
    }
  } catch (error) {
    console.error(`Erro ao verificar prazos do projeto ${projectId}:`, error);
  }
};

// Função para ser chamada periodicamente (pode ser integrada com um job scheduler)
export const scheduleDeadlineChecks = () => {
  const interval = 6 * 60 * 60 * 1000; // 6 horas em millisegundos
  checkTaskDeadlines();

  setInterval(() => {
    checkTaskDeadlines();
  }, interval);
};
