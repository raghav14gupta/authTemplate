// NotificationController — React component jo app start hone pe ek baar chalta hai.
// Ye background process nahi hai, UI component hai jo render kuch nahi karta.
// Ise log "Headless Component" bhi bolte hain.

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  requestNotificationPermission,
  getFCMToken,
  onTokenRefresh,
  setupForegroundListener,
  getInitialNotification,
  onNotificationOpenedApp,
} from './notificationService';
import {
  addNotification,
  setFcmToken,
  loadNotifications,
  setOpenModalOnLaunch,
} from '../../store/notificationSlice';

const NotificationController = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let foregroundUnsub = null;
    let tokenRefreshUnsub = null;
    let openedAppUnsub = null;

    const bootstrap = async () => {
      // 1. Android 13+ ke liye permission maango
      const permissionGranted = await requestNotificationPermission();

      if (!permissionGranted) {
        console.warn('[NotificationController] Permission not granted');
        return; // Permission nahi mili toh aage badhne ka fayda nahi
      }

      // 2. FCM token start pe hi manga lo
      const token = await getFCMToken();
      if (token) {
        dispatch(setFcmToken(token));
      }

      // 3. Storage se aate hi purani notifications Redux mein load kar lo
      dispatch(loadNotifications());

      // 4. Foreground listener set karo - active app mein
      foregroundUnsub = setupForegroundListener(notification => {
        dispatch(addNotification(notification)); // Nayi notification Redux mein daalo
      });

      // 5. Token refresh listener - agar Firebase token change kare toh hume pata ho
      tokenRefreshUnsub = onTokenRefresh(newToken => {
        dispatch(setFcmToken(newToken));
        // TODO: Agar backend update support maange toh yahan api call karo
      });

      // 6. Check karo - kya app bilkul band tha (killed) jab user ne notification tap kari?
      const initialNotification = await getInitialNotification();
      if (initialNotification) {
        // App abhi abhi start hua hai tap lagne pe - FarmerHomeScreen ko batao modal kholo
        dispatch(setOpenModalOnLaunch(true));
      }

      // 7. Background se app aage aaya kyuki user ne notification tap kari
      openedAppUnsub = onNotificationOpenedApp(() => {
        // App toh memory me hi tha, bas minimize tha - FarmerHomeScreen ko batao modal kholo
        dispatch(setOpenModalOnLaunch(true));
      });
    };

    bootstrap();

    // Cleanup taaki multiple listeners set na ho
    return () => {
      if (foregroundUnsub) foregroundUnsub();
      if (tokenRefreshUnsub) tokenRefreshUnsub();
      if (openedAppUnsub) openedAppUnsub();
    };
  }, [dispatch]);

  // Ye component UI mein kuch render nahi karega
  return null;
};

export default NotificationController;
