import { db } from "../db";
import { Task } from "../../schemas/tasks.schema";
import { v4 as uuidv4 } from "uuid";

// Tasks
export const getTasks = async () => {
  const tasks = await db.tasks.toArray();
  return tasks;
};

export const getTaskById = async (id: string) => {
  const task = await db.tasks.get(id);
  return task;
};

export const createTask = async (task: Omit<Task, "id">) => {
  const id = await db.tasks.add({
    ...task,
    id: uuidv4(),
  });
  const newTask = await getTaskById(id);
  return newTask;
};

export const updateTask = async (task: Task) => {
  await db.tasks.put(task);
};

export const deleteTask = async (id: string) => {
  await db.tasks.delete(id);
};
