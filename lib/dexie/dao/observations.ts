import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { InsertObservation, ObservationModel } from "../models/observation";
import { ObservationDto } from "@/lib/schemas/observation.schema";

export const createObservation = async (
  observation: InsertObservation
): Promise<ObservationModel["id"]> => {
  const id = await db.observations.add({
    ...observation,
    id: uuidv4(),
  });
  return id;
};

export const updateObservation = async (observation: ObservationModel) => {
  await db.observations.put(observation);
};

export const deleteObservation = async (id: string) => {
  await db.observations.delete(id);
};

export const getAllObservations = async (): Promise<ObservationDto[]> => {
  const observations = await db.observations.toArray();
  const observationDtos: ObservationDto[] = [];
  for (const observation of observations) {
    const observationDto = await getObservationById(observation.id);
    if (!observationDto) continue;
    observationDtos.push(observationDto);
  }
  return observationDtos;
};

export const getObservationById = async (
  id: ObservationModel["id"]
): Promise<ObservationDto | null> => {
  const observation = await db.observations.get(id);
  if (!observation) return null;

  return observation;
};

export const getAllObservationsByReportId = async (
  reportId: ObservationModel["reportId"]
): Promise<ObservationDto[]> => {
  const observations = await db.observations
    .where("reportId")
    .equals(reportId)
    .toArray();
  const observationDtos: ObservationDto[] = [];
  for (const observation of observations) {
    const observationDto = await getObservationById(observation.id);
    if (!observationDto) continue;
    observationDtos.push(observationDto);
  }
  return observationDtos;
};
