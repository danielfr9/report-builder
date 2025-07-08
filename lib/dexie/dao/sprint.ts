import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { InsertSprint, SprintModel } from "../models/sprint";
import { SprintDto } from "@/lib/schemas/sprint.schema";
import { parseISO } from "date-fns";

export const createSprint = async (
  sprint: InsertSprint
): Promise<SprintModel["id"]> => {
  const id = await db.sprints.add({
    ...sprint,
    id: uuidv4(),
  });
  return id;
};

export const updateSprint = async (sprint: SprintModel) => {
  await db.sprints.put(sprint);
};

export const deleteSprint = async (id: SprintModel["id"]) => {
  await db.sprints.delete(id);
};

export const bulkDeleteSprints = async (ids: SprintModel["id"][]) => {
  await db.sprints.bulkDelete(ids);
};

export const getSprintById = async (
  id: SprintModel["id"]
): Promise<SprintDto | null> => {
  const sprint = await db.sprints.get(id);
  if (!sprint) return null;

  return {
    id: sprint.id,
    name: sprint.name,
    startDate: parseISO(sprint.startDate),
    endDate: parseISO(sprint.endDate),
  };
};

export const getAllSprints = async (): Promise<SprintDto[]> => {
  const sprints = await db.sprints.toArray();
  const sprintDtos: SprintDto[] = [];
  for (const sprint of sprints) {
    const sprintDto = await getSprintById(sprint.id);
    if (!sprintDto) continue;
    sprintDtos.push(sprintDto);
  }
  return sprintDtos;
};
