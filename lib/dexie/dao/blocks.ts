import { db } from "../db";
import { Block } from "../../schemas/block.schema";
import { v4 as uuidv4 } from "uuid";

export const getBlocks = async () => {
  const blocks = await db.blocks.toArray();
  return blocks;
};

export const getBlockById = async (id: string) => {
  const block = await db.blocks.get(id);
  return block;
};

export const createBlock = async (block: Omit<Block, "id">) => {
  const id = await db.blocks.add({
    ...block,
    id: uuidv4(),
  });
  const newBlock = await getBlockById(id);
  return newBlock;
};

export const updateBlock = async (block: Block) => {
  await db.blocks.put(block);
};

export const deleteBlock = async (id: string) => {
  await db.blocks.delete(id);
};
