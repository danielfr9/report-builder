import {
  bulkDeleteSprints,
  createSprint,
  deleteSprint,
  getSprintById,
  updateSprint,
} from "../dexie/dao/sprint";
import { InsertSprint, SprintModel } from "../dexie/models/sprint";
import {
  createSprintSchema,
  deleteSprintSchema,
  SprintDto,
  updateSprintSchema,
} from "../schemas/sprint.schema";
import { ApiResponse } from "../interfaces/api-response.interface";
import { unlinkSprintFromReport } from "../dexie/dao/reports";

const createSprintAction = async (
  data: unknown
): Promise<ApiResponse<SprintDto>> => {
  const parsedSprint = createSprintSchema.safeParse(data);
  if (!parsedSprint.success) {
    return {
      success: false,
      error: parsedSprint.error.message,
    };
  }

  // Convert data to InsertSprint
  const insertSprint: InsertSprint = {
    ...parsedSprint.data,
    startDate: parsedSprint.data.startDate.toISOString(),
    endDate: parsedSprint.data.endDate.toISOString(),
  };

  try {
    const sprintId = await createSprint(insertSprint);

    const sprint = await getSprintById(sprintId);
    if (!sprint) {
      return {
        success: false,
        error: "Error al obtener el sprint",
      };
    }
    return { success: true, data: sprint };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al crear el sprint",
    };
  }
};

const updateSprintAction = async (
  data: unknown
): Promise<ApiResponse<SprintDto>> => {
  const parsedSprint = updateSprintSchema.safeParse(data);
  if (!parsedSprint.success) {
    return {
      success: false,
      error: parsedSprint.error.message,
    };
  }

  const updatedSprintItem: SprintModel = {
    ...parsedSprint.data,
    startDate: parsedSprint.data.startDate.toISOString(),
    endDate: parsedSprint.data.endDate.toISOString(),
  };

  try {
    await updateSprint(updatedSprintItem);
    const sprint = await getSprintById(parsedSprint.data.id);
    if (!sprint) {
      return {
        success: false,
        error: "Error al obtener el sprint",
      };
    }
    return { success: true, data: sprint };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al actualizar el sprint",
    };
  }
};

const deleteSprintAction = async (
  data: unknown
): Promise<ApiResponse<null>> => {
  const parsedSprint = deleteSprintSchema.safeParse(data);
  if (!parsedSprint.success) {
    return {
      success: false,
      error: parsedSprint.error.message,
    };
  }

  try {
    await deleteSprint(parsedSprint.data.id);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar el sprint",
    };
  }
};

const bulkDeleteSprintsAction = async (
  data: unknown
): Promise<ApiResponse<null>> => {
  const parsedSprints = deleteSprintSchema.array().safeParse(data);
  if (!parsedSprints.success) {
    return {
      success: false,
      error: parsedSprints.error.message,
    };
  }

  try {
    await bulkDeleteSprints(parsedSprints.data.map((sprint) => sprint.id));
    await unlinkSprintFromReport(parsedSprints.data.map((sprint) => sprint.id));
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar los sprints",
    };
  }
};

export {
  createSprintAction,
  updateSprintAction,
  deleteSprintAction,
  bulkDeleteSprintsAction,
};
