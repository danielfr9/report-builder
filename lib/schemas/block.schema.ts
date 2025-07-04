import { z } from "zod";

export const blockSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export type Block = z.infer<typeof blockSchema>;

export const createBlockSchema = z.object({
  description: z.string().min(1, { message: "Descripción es requerida" }),
});

export type NewBlock = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = createBlockSchema.extend({
  id: z.string().min(1, { message: "ID es requerido" }),
});
