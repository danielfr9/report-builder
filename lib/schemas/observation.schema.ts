import { z } from "zod";

export const observationSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export type Observation = z.infer<typeof observationSchema>;

export const createObservationSchema = z.object({
  description: z.string().min(1, { message: "La observación es requerida" }),
});

export const updateObservationSchema = createObservationSchema.extend({
  id: z.string().min(1, { message: "ID es requerido" }),
});
