import {
  createTask,
  createTasks,
  deleteTask,
  getTaskById,
  updateTask,
} from "../dexie/dao/tasks";
import { InsertTask, TaskModel } from "../dexie/models/task";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  createTaskSchema,
  deleteTaskSchema,
  importTasksIntoReportSchema,
  TaskDto,
  updateTaskSchema,
} from "../schemas/tasks.schema";

const createTaskAction = async (
  data: unknown
): Promise<ApiResponse<TaskDto>> => {
  const parsedTask = createTaskSchema.safeParse(data);
  if (!parsedTask.success) {
    return {
      success: false,
      error: parsedTask.error.message,
    };
  }

  const insertTask: InsertTask = {
    ...parsedTask.data,
    finishDate: parsedTask.data.finishDate.toISOString(),
  };

  try {
    const taskId = await createTask(insertTask);
    const task = await getTaskById(taskId);
    if (!task) {
      return {
        success: false,
        error: "Error al obtener la tarea",
      };
    }
    return { success: true, data: task };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al crear la tarea",
    };
  }
};

const importTasksIntoReportAction = async (
  data: unknown
): Promise<ApiResponse<TaskDto[]>> => {
  const parsedTasks = importTasksIntoReportSchema.safeParse(data);
  if (!parsedTasks.success) {
    return {
      success: false,
      error: parsedTasks.error.message,
    };
  }

  try {
    const insertTasks: InsertTask[] = [];

    for (const importTask of parsedTasks.data.tasks) {
      const taskDto = await getTaskById(importTask.id);
      if (!taskDto) {
        return {
          success: false,
          error: `Error al obtener la tarea ID: ${importTask.id}`,
        };
      }

      // Exclude the ID field since we want new tasks with new IDs
      const { id, ...taskWithoutId } = taskDto;
      insertTasks.push({
        ...taskWithoutId,
        reportId: parsedTasks.data.reportId,
        finishDate: new Date().toISOString(),
      });
    }

    const newTasksIds = await createTasks(insertTasks);
    const newTasks = await Promise.all(
      newTasksIds.map((newTaskId) => getTaskById(newTaskId))
    ).then((tasks) => tasks.filter((task) => task !== null));

    return { success: true, data: newTasks };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al importar las tareas" };
  }
};

const updateTaskAction = async (
  data: unknown
): Promise<ApiResponse<TaskDto>> => {
  const parsedTask = updateTaskSchema.safeParse(data);
  if (!parsedTask.success) {
    return {
      success: false,
      error: parsedTask.error.message,
    };
  }

  const updatedTaskItem: TaskModel = {
    ...parsedTask.data,
    finishDate: parsedTask.data.finishDate.toISOString(),
  };

  try {
    await updateTask(updatedTaskItem);
    const task = await getTaskById(parsedTask.data.id);
    if (!task) {
      return {
        success: false,
        error: "Error al obtener la tarea",
      };
    }
    return { success: true, data: task };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al actualizar la tarea",
    };
  }
};

const deleteTaskAction = async (data: unknown): Promise<ApiResponse<null>> => {
  const parsedTask = deleteTaskSchema.safeParse(data);
  if (!parsedTask.success) {
    return {
      success: false,
      error: parsedTask.error.message,
    };
  }

  try {
    await deleteTask(parsedTask.data.id);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar la tarea",
    };
  }
};

export {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  importTasksIntoReportAction,
};
