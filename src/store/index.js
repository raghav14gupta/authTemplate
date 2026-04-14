import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';
import logger from 'redux-logger'; // Import logger
const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
  },
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware();

    if (__DEV__) {
      return middleware.concat(logger); // 👈 only dev
    }

    return middleware;
  },
});

export default store;
