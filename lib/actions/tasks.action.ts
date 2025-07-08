import {
  createTask,
  deleteTask,
  getTaskById,
  updateTask,
} from "../dexie/dao/tasks";
import { InsertTask, TaskModel } from "../dexie/models/task";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  createTaskSchema,
  deleteTaskSchema,
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

export { createTaskAction, updateTaskAction, deleteTaskAction };
