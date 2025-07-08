import { z } from "zod";

export const BlockDtoSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
  description: z.string().min(1, { message: "Descripción es requerida" }),
});
export type BlockDto = z.infer<typeof BlockDtoSchema>;

export const createBlockSchema = BlockDtoSchema.omit({
  id: true,
});

export type CreateBlock = z.infer<typeof createBlockSchema>;
export type UpdateBlock = z.infer<typeof BlockDtoSchema>;

export const deleteBlockSchema = BlockDtoSchema.pick({
  id: true,
});
export type DeleteBlock = z.infer<typeof deleteBlockSchema>;
