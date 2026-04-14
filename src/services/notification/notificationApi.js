import api from '../api';

const notificationApi = {
  saveFcmToken: async fcmToken => {
    const requestBody = {
      fcmToken: fcmToken,
    };

    const response = await api.post('/notification/save-token', requestBody);

    return response.data;
  },

  getBroadcasts: async (page, limit) => {
    // Default values manually set (no shorthand)
    if (page === undefined || page === null) {
      page = 1;
    }

    if (limit === undefined || limit === null) {
      limit = 20;
    }

    try {
      if (__DEV__) {
        console.log('[BROADCAST][API] Fetching page:', page, 'limit:', limit);
      }

      const url = '/broadcast?page=' + page + '&limit=' + limit;

      const response = await api.get(url);

      let rawData = null;

      if (response && response.data) {
        rawData = response.data;
      }

      let broadcastList = [];

      if (rawData && Array.isArray(rawData.data)) {
        broadcastList = rawData.data;
      } else {
        broadcastList = [];
      }

      if (__DEV__) {
        console.log('[BROADCAST][API] Fetched count:', broadcastList.length);
      }

      let totalValue = null;

      if (rawData && rawData.total !== undefined && rawData.total !== null) {
        totalValue = rawData.total;
      } else {
        totalValue = broadcastList.length;
      }

      let pageValue = null;

      if (rawData && rawData.page !== undefined && rawData.page !== null) {
        pageValue = rawData.page;
      } else {
        pageValue = page;
      }

      return {
        success: true,
        data: broadcastList,
        total: totalValue,
        page: pageValue,
      };
    } catch (error) {
      let errorMessage = 'Something went wrong';
      let errorType = 'BROADCAST_API_ERROR';
      let statusCode = null;
      let backendError = null;

      if (error && error.message) {
        errorMessage = error.message;
      }

      if (error && error.type) {
        errorType = error.type;
      }

      if (error && error.statusCode) {
        statusCode = error.statusCode;
      }

      if (error && error.backendError) {
        backendError = error.backendError;
      }

      const normalizedError = {
        message: errorMessage,
        type: errorType,
        statusCode: statusCode,
        backendError: backendError,
      };

      console.error(
        '[BROADCAST][API] Failed to fetch broadcasts:',
        normalizedError,
      );

      return {
        success: false,
        data: [],
        error: normalizedError,
      };
    }
  },
};

export default notificationApi;
