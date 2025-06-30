import { z } from "zod";

export const createBlockSchema = z.object({
  description: z.string().min(1, { message: "Descripción es requerida" }),
});

export const updateBlockSchema = createBlockSchema.extend({
  id: z.string().min(1, { message: "ID es requerido" }),
});
