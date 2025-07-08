import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { InsertTask, TaskModel } from "../models/task";
import { TaskDto } from "@/lib/schemas/tasks.schema";

export const createTask = async (task: InsertTask) => {
  const id = await db.tasks.add({
    ...task,
    id: uuidv4(),
  });
  const newTask = await getTaskById(id);
  return newTask;
};

export const updateTask = async (task: TaskModel) => {
  await db.tasks.put(task);
};

export const deleteTask = async (id: TaskModel["id"]) => {
  await db.tasks.delete(id);
};

export const getAllTasks = async (): Promise<TaskDto[]> => {
  const tasks = await db.tasks.toArray();
  const taskDtos: TaskDto[] = [];
  for (const task of tasks) {
    const taskDto = await getTaskById(task.id);
    if (!taskDto) continue;
    taskDtos.push(taskDto);
  }
  return taskDtos;
};

export const getTaskById = async (
  id: TaskModel["id"]
): Promise<TaskDto | null> => {
  const task = await db.tasks.get(id);
  if (!task) return null;

  return task;
};

export const getAllTasksByReportId = async (
  reportId: TaskModel["reportId"]
): Promise<TaskDto[]> => {
  const tasks = await db.tasks.where("reportId").equals(reportId).toArray();
  const taskDtos: TaskDto[] = [];
  for (const task of tasks) {
    const taskDto = await getTaskById(task.id);
    if (!taskDto) continue;
    taskDtos.push(taskDto);
  }
  return taskDtos;
};
