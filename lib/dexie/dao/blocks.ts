import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { BlockModel, InsertBlock } from "../models/block";
import { BlockDto } from "@/lib/schemas/block.schema";

export const createBlock = async (
  block: InsertBlock
): Promise<BlockModel["id"]> => {
  const id = await db.blocks.add({
    ...block,
    id: uuidv4(),
  });
  return id;
};

export const updateBlock = async (block: BlockModel) => {
  await db.blocks.put(block);
};

export const deleteBlock = async (id: BlockModel["id"]) => {
  await db.blocks.delete(id);
};

export const getAllBlocks = async (): Promise<BlockDto[]> => {
  const blocks = await db.blocks.toArray();
  const blockDtos: BlockDto[] = [];
  for (const block of blocks) {
    const blockDto = await getBlockById(block.id);
    if (!blockDto) continue;
    blockDtos.push(blockDto);
  }
  return blockDtos;
};

export const getBlockById = async (
  id: BlockModel["id"]
): Promise<BlockDto | null> => {
  const block = await db.blocks.get(id);
  if (!block) return null;

  return {
    id: block.id,
    description: block.description,
    reportId: block.reportId,
  };
};

export const getAllBlocksByReportId = async (
  reportId: BlockModel["reportId"]
): Promise<BlockDto[]> => {
  const blocks = await db.blocks.where("reportId").equals(reportId).toArray();
  const blockDtos: BlockDto[] = [];
  for (const block of blocks) {
    const blockDto = await getBlockById(block.id);
    if (!blockDto) continue;
    blockDtos.push(blockDto);
  }
  return blockDtos;
};
