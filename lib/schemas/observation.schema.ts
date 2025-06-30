import { z } from "zod";

export const createObservationSchema = z.object({
  description: z.string().min(1, { message: "La observación es requerida" }),
});

export const updateObservationSchema = createObservationSchema.extend({
  id: z.string().min(1, { message: "ID es requerido" }),
});
