import api from '../api'; // 👈 shared Axios HTTP client

/**
 * 🌾 Add a new farm for the logged-in farmer.
 * POST /farm/addFarm
 * @param {{ farmName: string, farmArea: number, unit: string, geojson: object }} payload
 */
export const addFarm = async (payload) => {
  try {
    const response = await api.post('/farm/addFarm', payload);

    if (__DEV__) {
      console.log('[FARM][SERVICE] Farm added successfully:', response?.data);
    }

    return {
      success: true,
      data: response?.data,
    };
  } catch (error) {
    const normalizedError = {
      message: error?.message || 'Something went wrong',
      type: error?.type || 'ADD_FARM_API_ERROR',
      statusCode: error?.statusCode || error?.response?.status || null,
      backendError: error?.backendError || error?.response?.data || null,
    };

    console.error('[FARM][SERVICE] Failed to add farm:', normalizedError);

    return {
      success: false,
      data: null,
      error: normalizedError,
    };
  }
};
