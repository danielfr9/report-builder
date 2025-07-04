import { db } from "../db";
import { Observation } from "../../schemas/observation.schema";
import { v4 as uuidv4 } from "uuid";

// Observations
export const getObservations = async () => {
  const observations = await db.observations.toArray();
  return observations;
};

export const getObservationById = async (id: string) => {
  const observation = await db.observations.get(id);
  return observation;
};

export const createObservation = async (
  observation: Omit<Observation, "id">
) => {
  const id = await db.observations.add({
    ...observation,
    id: uuidv4(),
  });
  const newObservation = await getObservationById(id);
  return newObservation;
};

export const updateObservation = async (observation: Observation) => {
  await db.observations.put(observation);
};

export const deleteObservation = async (id: string) => {
  await db.observations.delete(id);
};
