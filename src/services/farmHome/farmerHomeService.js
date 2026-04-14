import api from '../api'; // 👈 same level se import

const normalizePosters = responseData => {
  const sourceList = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
    ? responseData
    : [];

  return sourceList.flatMap(item => {
    if (Array.isArray(item?.posters)) {
      return item.posters.filter(
        poster => poster && typeof poster === 'object',
      );
    }

    return item && typeof item === 'object' ? [item] : [];
  });
};

export const caraousalAdvertisment = async () => {
  try {
    const response = await api.get('/advertisement-posters');
    const posters = normalizePosters(response?.data);

    if (__DEV__) {
      console.log('[ADS][SERVICE] parsed posters:', posters.length);
    }

    return {
      success: true,
      data: posters,
    };
  } catch (error) {
    const normalizedError = {
      message: error?.message || 'Something went wrong',
      type: error?.type || 'ADVERTISEMENT_API_ERROR',
      statusCode: error?.statusCode || error?.response?.status || null,
      backendError: error?.backendError || error?.response?.data || null,
    };

    console.error('[ADS][SERVICE] failed to fetch posters:', normalizedError);

    return {
      success: false,
      data: [],
      error: normalizedError,
    };
  }
};
