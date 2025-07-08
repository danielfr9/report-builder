import { z } from "zod";

export const blockModelSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  description: z.string().min(1, { message: "Descripción es requerida" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
});
export type BlockModel = z.infer<typeof blockModelSchema>;
export type InsertBlock = Omit<BlockModel, "id">;
