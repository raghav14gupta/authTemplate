// FCM notification service — Firebase SDK se baat karne wali file.
// Jaise authApi.js backend se baat karti hai — ye Firebase se baat karegi.
// MIGRATED: Deprecated namespaced API (messaging()) → Modular API (v22+)
// Ref: https://rnfirebase.io/migrating-to-v22

import {
  getMessaging,                  // messaging instance banata hai — replaces implicit app lookup
  requestPermission,             // replaces messaging().requestPermission()
  AuthorizationStatus,           // replaces messaging.AuthorizationStatus (static enum)
  getToken,                      // replaces messaging().getToken()
  onMessage,                     // replaces messaging().onMessage()
  setBackgroundMessageHandler,   // replaces messaging().setBackgroundMessageHandler()
  onTokenRefresh as _onTokenRefresh,            // replaces messaging().onTokenRefresh()
  getInitialNotification as _getInitialNotification, // replaces messaging().getInitialNotification()
  onNotificationOpenedApp as _onNotificationOpenedApp, // replaces messaging().onNotificationOpenedApp()
  registerDeviceForRemoteMessages, // replaces messaging().registerDeviceForRemoteMessages()
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app'; // replaces implicit getApp() inside namespaced modules
import { saveNotification } from './notificationStorage';

// Helper: reusable messaging instance — DRY, hamesha ek hi jagah se lo
const getMsg = () => getMessaging(getApp());

/**
 * User se notification permission maango (Android 13+ pe zaroori hai).
 * Returns true agar permission mili, false agar deny kiya.
 */
export const requestNotificationPermission = async () => {
  try {
    // MIGRATED: messaging().requestPermission() → requestPermission(getMsg())
    const authStatus = await requestPermission(getMsg());

    // MIGRATED: messaging.AuthorizationStatus → AuthorizationStatus (named import)
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (__DEV__) {
      console.log(
        '[FCM] Permission status:',
        authStatus,
        '| Enabled:',
        enabled,
      );
    }

    return enabled;
  } catch (err) {
    console.warn('[FCM] Permission request failed:', err);
    return false;
  }
};

/**
 * Phone ka unique FCM token lo Firebase se.
 * Ye token backend ko bhejte hain taaki wo is device pe notification bhej sake.
 */
export const getFCMToken = async () => {
  try {
    // MIGRATED: messaging().getToken() → getToken(getMsg())
    const token = await getToken(getMsg());

    if (__DEV__) {
      console.log('[FCM] Device Token:', token);
    }

    return token;
  } catch (err) {
    console.warn('[FCM] getToken error:', err);
    return null;
  }
};

/**
 * Login ke baad call karo — device register karo aur FCM token return karo.
 *
 * getFCMToken() se alag kyun?
 * - getFCMToken() → NotificationController use karta hai (app start pe, sirf token chahiye)
 * - registerAndGetFcmToken() → Login ke baad use hota hai — pehle device register
 *   karta hai (Android pe zaroori hai), phir fresh token leta hai.
 *
 * @returns {string|null} FCM token ya null agar kuch gadbad ho
 */
export const registerAndGetFcmToken = async () => {
  try {
    // MIGRATED: messaging().registerDeviceForRemoteMessages() → registerDeviceForRemoteMessages(getMsg())
    await registerDeviceForRemoteMessages(getMsg());

    // MIGRATED: messaging().getToken() → getToken(getMsg())
    const token = await getToken(getMsg());

    if (__DEV__) {
      console.log('[FCM] Post-login token registered:', token);
    }

    return token;
  } catch (err) {
    console.warn('[FCM] registerAndGetFcmToken error:', err);
    return null;
  }
};

/**
 * Token refresh listener — Firebase kabhi kabhi token badal deta hai.
 * Naya token mile toh backend ko update karna padta hai.
 * Returns: unsubscribe function (cleanup ke liye).
 */
export const onTokenRefresh = callback => {
  // MIGRATED: messaging().onTokenRefresh(cb) → _onTokenRefresh(getMsg(), cb)
  return _onTokenRefresh(getMsg(), newToken => {
    if (__DEV__) {
      console.log('[FCM] Token refreshed:', newToken);
    }
    if (callback) callback(newToken);
  });
};

/**
 * FOREGROUND listener — jab app khula hai screen pe tab notification suno.
 *
 * Kya karta hai:
 * 1. Notification aaye → storage mein save
 * 2. Callback fire kare → tum Redux update kar sako
 *
 * Returns: unsubscribe function (cleanup ke liye).
 */
export const setupForegroundListener = onNotificationReceived => {
  // MIGRATED: messaging().onMessage(handler) → onMessage(getMsg(), handler)
  return onMessage(getMsg(), async remoteMessage => {
    if (__DEV__) {
      console.log(
        '[FCM] Foreground notification:',
        JSON.stringify(remoteMessage, null, 2),
      );
    }

    // Remote message se clean notification object banao
    const notification = {
      messageId: remoteMessage.messageId,
      title:
        remoteMessage.notification?.title || remoteMessage.data?.title || '',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
      data: remoteMessage.data || {},
    };

    // AsyncStorage mein save karo (permanent)
    const saved = await saveNotification(notification);

    // Callback se Redux update karo (fast UI)
    if (onNotificationReceived && saved) {
      onNotificationReceived(saved);
    }
  });
};

/**
 * BACKGROUND/KILLED handler — jab app band hai ya minimize hai.
 *
 * ⚠️ IMPORTANT: Ye index.js mein call hona chahiye, AppRegistry se PEHLE!
 * Kyunki killed state mein app ka React tree exist nahi karta —
 * sirf ye handler run hota hai.
 *
 * Yahan sirf AsyncStorage mein save karte hain (Redux available nahi hota).
 */
export const setupBackgroundHandler = () => {
  // MIGRATED: messaging().setBackgroundMessageHandler(h) → setBackgroundMessageHandler(getMsg(), h)
  setBackgroundMessageHandler(getMsg(), async remoteMessage => {
    if (__DEV__) {
      console.log(
        '[FCM] Background/Killed notification:',
        JSON.stringify(remoteMessage, null, 2),
      );
    }

    const notification = {
      messageId: remoteMessage.messageId,
      title:
        remoteMessage.notification?.title || remoteMessage.data?.title || '',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
      data: remoteMessage.data || {},
    };

    // Sirf storage mein save — Redux available nahi hai background mein!
    await saveNotification(notification);
  });
};

/**
 * Check karo — kya app KILLED state se notification TAP karke khula hai?
 * Agar haan → notification data return karta hai.
 * Agar nahi → null return karta hai.
 */
export const getInitialNotification = async () => {
  try {
    // MIGRATED: messaging().getInitialNotification() → _getInitialNotification(getMsg())
    const remoteMessage = await _getInitialNotification(getMsg());

    if (remoteMessage) {
      if (__DEV__) {
        console.log(
          '[FCM] App opened from KILLED state via notification tap:',
          remoteMessage,
        );
      }

      return {
        messageId: remoteMessage.messageId,
        title:
          remoteMessage.notification?.title || remoteMessage.data?.title || '',
        body:
          remoteMessage.notification?.body || remoteMessage.data?.body || '',
        data: remoteMessage.data || {},
      };
    }

    return null;
  } catch (err) {
    console.warn('[FCM] getInitialNotification error:', err);
    return null;
  }
};

/**
 * BACKGROUND se notification TAP karke app khola → ye fire hota hai.
 * (Killed state ke liye getInitialNotification use hota hai — ye sirf background ke liye)
 * Returns: unsubscribe function.
 */
export const onNotificationOpenedApp = callback => {
  // MIGRATED: messaging().onNotificationOpenedApp(cb) → _onNotificationOpenedApp(getMsg(), cb)
  return _onNotificationOpenedApp(getMsg(), remoteMessage => {
    if (__DEV__) {
      console.log(
        '[FCM] Notification tap opened app from BACKGROUND:',
        remoteMessage,
      );
    }

    if (callback) {
      callback({
        messageId: remoteMessage.messageId,
        title:
          remoteMessage.notification?.title || remoteMessage.data?.title || '',
        body:
          remoteMessage.notification?.body || remoteMessage.data?.body || '',
        data: remoteMessage.data || {},
      });
    }
  });
};
