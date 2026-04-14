import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  clearAllNotifications as clearStorage,
} from '../services/notification/notificationStorage';
import { registerAndGetFcmToken } from '../services/notification/notificationService';
import notificationApi from '../services/notification/notificationApi';

// Thunk: AsyncStorage se notifications padh ke Redux mein laao
export const loadNotifications = createAsyncThunk(
  'notification/loadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await getNotifications();
      const unreadCount = await getUnreadCount();
      return { notifications, unreadCount };
    } catch (err) {
      return rejectWithValue('Failed to load notifications');
    }
  },
);

// Thunk: Saare notifications ko "read" mark karo
export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllAsRead();
      return true;
    } catch (err) {
      return rejectWithValue('Failed to mark as read');
    }
  },
);

// Thunk: Saare notifications delete karo (logout ke waqt)
export const clearNotifications = createAsyncThunk(
  'notification/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await clearStorage();
      return true;
    } catch (err) {
      return rejectWithValue('Failed to clear notifications');
    }
  },
);

// Thunk: Login ke baad FCM token lo aur backend ko bhejo
// VerifyMobileScreen is ek thunk ko dispatch karti hai — aur kuch nahi
export const saveFcmTokenToBackend = createAsyncThunk(
  'notification/saveFcmToken',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Firebase se device register karke fresh token lo
      const token = await registerAndGetFcmToken();

      if (!token) {
        // Token na mile toh silently skip karo — login mat roko
        console.warn('[FCM] No token received — skipping backend save');
        return null;
      }

      // Step 2: Token backend ko bhejo
      await notificationApi.saveFcmToken(token);

      if (__DEV__) {
        console.log('[FCM] Token saved to backend successfully');
      }

      return token;
    } catch (err) {
      // FCM failure se login flow mat ruko — rejectWithValue use nahi karte
      console.warn('[FCM] saveFcmTokenToBackend failed (ignored):', err?.message);
      return null;
    }
  },
);

// Thunk: Backend se broadcasts fetch karo — NotificationModal mein list dikhane ke liye
// Page aur limit pass karte hain pagination ke liye
export const fetchBroadcasts = createAsyncThunk(
  'notification/fetchBroadcasts',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    // notificationApi.getBroadcasts() call karo
    // Ye function already error normalize karke return karta hai isliye
    // hume yahan alag try/catch nahi chahiye
    const result = await notificationApi.getBroadcasts(page, limit);

    if (!result.success) {
      // API ne failure return kiya — Redux ko error batao
      return rejectWithValue(result.error?.message || 'Failed to fetch broadcasts');
    }

    // Sab theek raha — data, total aur page return karo
    // Ye sab action.payload mein aayega extraReducers mein
    return {
      data: result.data,
      total: result.total,
      page: result.page,
    };
  },
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    // FCM local notifications (AsyncStorage se)
    notifications: [],
    unreadCount: 0,
    fcmToken: null,
    loading: false,
    openModalOnLaunch: false, // Ye wo flag hai jo notification tap se modal open karega

    // Backend broadcasts (API se)
    broadcasts: [],          // Broadcasts ki list jo modal mein dikhegi
    broadcastsTotal: 0,      // Backend mein total kitne broadcasts hain
    broadcastsPage: 1,       // Abhi kaun sa page load hua hai
    broadcastsLoading: false, // true jab API call chal rahi ho
    broadcastsError: null,   // Agar API fail ho toh error message yahan aayega
  },
  reducers: {
    // Jab naya notification aaye (foreground mein) toh ye call hoga
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount += 1;
    },
    // FCM token save karne ke liye
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    // Modal auto-open flag ko toggle karne ke liye
    setOpenModalOnLaunch: (state, action) => {
      state.openModalOnLaunch = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNotifications.pending, state => {
        state.loading = true;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(loadNotifications.rejected, state => {
        state.loading = false;
      })
      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(clearNotifications.fulfilled, state => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      // saveFcmTokenToBackend — token Redux mein bhi store karo
      .addCase(saveFcmTokenToBackend.fulfilled, (state, action) => {
        if (action.payload) {
          state.fcmToken = action.payload;
        }
      })

      // fetchBroadcasts — API call shuru hone pe loading true karo
      .addCase(fetchBroadcasts.pending, state => {
        state.broadcastsLoading = true;
        state.broadcastsError = null; // Pehle wala error clear karo
      })

      // fetchBroadcasts — API se data aa gaya, state update karo
      .addCase(fetchBroadcasts.fulfilled, (state, action) => {
        state.broadcastsLoading = false;
        state.broadcastsError = null;

        // Agar page 1 hai matlab fresh load hai — list replace karo
        // Agar page > 1 hai matlab pull-to-load-more hai — list ke end mein add karo
        if (action.payload.page === 1) {
          state.broadcasts = action.payload.data;
        } else {
          state.broadcasts = [...state.broadcasts, ...action.payload.data];
        }

        state.broadcastsTotal = action.payload.total;
        state.broadcastsPage = action.payload.page;
      })

      // fetchBroadcasts — API fail ho gayi
      .addCase(fetchBroadcasts.rejected, (state, action) => {
        state.broadcastsLoading = false;
        // Error message save karo taaki UI mein error dikhaya ja sake
        state.broadcastsError = action.payload || 'Failed to fetch broadcasts';
      });
  },
});

export const { addNotification, setFcmToken, setOpenModalOnLaunch } =
  notificationSlice.actions;

export default notificationSlice.reducer;
