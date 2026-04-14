// Storage layer: AsyncStorage-based notification persistence.
// Jaise authStorage.js auth session save karti hai — ye file notifications save karegi.
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@retailManagementShop/notifications';
const UNREAD_COUNT_KEY = '@retailManagementShop/unread_count';

/**
 * Ek naya notification save karo (newest first — array ke start mein).
 * Har notification ka structure: { id, title, body, data, timestamp, read }
 * Max 100 notifications rakhte hain — purane auto-delete ho jaate hain.
 */
export const saveNotification = async notification => {
  try {
    // Pehle existing notifications padho
    const existing = await getNotifications();

    // Naya notification object banao
    const newNotification = {
      id:
        notification.messageId ||
        `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || '',
      body: notification.body || '',
      data: notification.data || {},
      timestamp: Date.now(),
      read: false,
    };

    // Naya notification START mein daalo (latest first)
    const updated = [newNotification, ...existing];

    // Max 100 rakhte hain — baaki purane hat jaayenge
    const trimmed = updated.slice(0, 100);

    // AsyncStorage mein save karo
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));

    // Unread count badhao
    const currentUnread = await getUnreadCount();
    await AsyncStorage.setItem(
      UNREAD_COUNT_KEY,
      JSON.stringify(currentUnread + 1),
    );

    return newNotification;
  } catch (err) {
    console.warn('[NotificationStorage] saveNotification error:', err);
    return null;
  }
};

/**
 * Saare stored notifications wapas do (newest first).
 */
export const getNotifications = async () => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[NotificationStorage] getNotifications error:', err);
    return [];
  }
};

/**
 * Kitne unread notifications hain — count do.
 * Bell badge pe dikhane ke liye.
 */
export const getUnreadCount = async () => {
  try {
    const raw = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
    if (!raw) return 0;
    return JSON.parse(raw);
  } catch (err) {
    return 0;
  }
};

/**
 * Saare notifications "read" mark karo + unread count = 0.
 * Jab user notification modal khole tab call hoga.
 */
export const markAllAsRead = async () => {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, JSON.stringify(0));
  } catch (err) {
    console.warn('[NotificationStorage] markAllAsRead error:', err);
  }
};

/**
 * Sab notifications delete karo — logout pe ya "clear all" pe.
 */
export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, JSON.stringify(0));
  } catch (err) {
    console.warn('[NotificationStorage] clearAllNotifications error:', err);
  }
};
