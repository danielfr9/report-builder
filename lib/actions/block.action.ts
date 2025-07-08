import {
  createBlockSchema,
  deleteBlockSchema,
  updateBlockSchema,
} from "../schemas/block.schema";
import { BlockDto } from "../schemas/block.schema";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  createBlock,
  deleteBlock,
  getBlockById,
  updateBlock,
} from "../dexie/dao/blocks";
import { BlockModel, InsertBlock } from "../dexie/models/block";

const createBlockAction = async (
  data: unknown
): Promise<ApiResponse<BlockDto>> => {
  const parsedBlock = createBlockSchema.safeParse(data);
  if (!parsedBlock.success) {
    return {
      success: false,
      error: parsedBlock.error.message,
    };
  }

  const newBlockItem: InsertBlock = {
    ...parsedBlock.data,
  };

  try {
    const newBlockId = await createBlock(newBlockItem);
    const block = await getBlockById(newBlockId);
    if (!block) {
      return {
        success: false,
        error: "Error al obtener el bloque",
      };
    }
    return { success: true, data: block };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al crear el bloque",
    };
  }
};

const updateBlockAction = async (
  data: unknown
): Promise<ApiResponse<BlockDto>> => {
  const parsedBlock = updateBlockSchema.safeParse(data);
  if (!parsedBlock.success) {
    return {
      success: false,
      error: parsedBlock.error.message,
    };
  }

  const updatedBlockItem: BlockModel = {
    ...parsedBlock.data,
  };

  try {
    await updateBlock(updatedBlockItem);
    const block = await getBlockById(parsedBlock.data.id);
    if (!block) {
      return {
        success: false,
        error: "Error al obtener el bloque",
      };
    }
    return { success: true, data: block };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al actualizar el bloque",
    };
  }
};

const deleteBlockAction = async (data: unknown): Promise<ApiResponse<null>> => {
  const parsedBlock = deleteBlockSchema.safeParse(data);
  if (!parsedBlock.success) {
    return {
      success: false,
      error: parsedBlock.error.message,
    };
  }

  try {
    await deleteBlock(parsedBlock.data.id);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar el bloque",
    };
  }
};

export { createBlockAction, updateBlockAction, deleteBlockAction };
