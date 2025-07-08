import {
  createObservationSchema,
  deleteObservationSchema,
  updateObservationSchema,
} from "../schemas/observation.schema";
import { ObservationDto } from "../schemas/observation.schema";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  createObservation,
  deleteObservation,
  getObservationById,
  updateObservation,
} from "../dexie/dao/observations";
import { ObservationModel } from "../dexie/models/observation";

const createObservationAction = async (
  data: unknown
): Promise<ApiResponse<ObservationDto>> => {
  const parsedObservation = createObservationSchema.safeParse(data);
  if (!parsedObservation.success) {
    return {
      success: false,
      error: parsedObservation.error.message,
    };
  }

  try {
    const newObservationId = await createObservation(parsedObservation.data);
    const observation = await getObservationById(newObservationId);
    if (!observation) {
      return {
        success: false,
        error: "Error al obtener la observación",
      };
    }
    return { success: true, data: observation };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al crear la observación",
    };
  }
};

const updateObservationAction = async (
  data: unknown
): Promise<ApiResponse<ObservationDto>> => {
  const parsedObservation = updateObservationSchema.safeParse(data);
  if (!parsedObservation.success) {
    return {
      success: false,
      error: parsedObservation.error.message,
    };
  }

  const updatedObservationItem: ObservationModel = {
    ...parsedObservation.data,
  };

  try {
    await updateObservation(updatedObservationItem);
    const observation = await getObservationById(parsedObservation.data.id);
    if (!observation) {
      return {
        success: false,
        error: "Error al obtener la observación",
      };
    }
    return { success: true, data: observation };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al actualizar la observación",
    };
  }
};

const deleteObservationAction = async (
  data: unknown
): Promise<ApiResponse<null>> => {
  const parsedObservation = deleteObservationSchema.safeParse(data);
  if (!parsedObservation.success) {
    return {
      success: false,
      error: parsedObservation.error.message,
    };
  }

  try {
    await deleteObservation(parsedObservation.data.id);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar la observación",
    };
  }
};

export {
  createObservationAction,
  updateObservationAction,
  deleteObservationAction,
};
