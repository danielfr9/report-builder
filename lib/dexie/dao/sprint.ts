import { db } from "../db";
import { Sprint } from "../../schemas/sprint.schema";
import { v4 as uuidv4 } from "uuid";

export const getSprints = async () => {
  const sprints = await db.sprints.toArray();
  return sprints;
};

export const getSprintById = async (id: string) => {
  const sprint = await db.sprints.get(id);
  return sprint;
};

export const createSprint = async (sprint: Omit<Sprint, "id">) => {
  const id = await db.sprints.add({
    ...sprint,
    id: uuidv4(),
  });
  const newSprint = await getSprintById(id);
  return newSprint;
};

export const updateSprint = async (sprint: Sprint) => {
  await db.sprints.put(sprint);
};

export const deleteSprint = async (id: string) => {
  await db.sprints.delete(id);
};

export const deleteSprints = async (ids: string[]) => {
  await db.sprints.bulkDelete(ids);
};
