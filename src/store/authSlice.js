import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  saveAuthSession,
  getStoredAuthSession,
  removeAuthSession,
} from '../services/auth/authStorage';
import authApi from '../services/auth/authApi';

// THUNK: App start pe disk check
export const checkStoredToken = createAsyncThunk(
  'auth/checkStoredToken',
  async (_, { rejectWithValue }) => {
    try {
      return await getStoredAuthSession();
    } catch (err) {
      return rejectWithValue('Session restore failed. Please login again.');
    }
  },
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ mobile, role }, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOtp({ mobile, role });

      if (response?.success) {
        return response;
      }

      return rejectWithValue(response?.message || 'Failed to send OTP');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Send OTP failed');
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ mobile, otp, role }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp({ mobile, otp, role });

      if (response?.token) {
        await saveAuthSession({
          token: response.token,
          user: response.user,
          refreshToken: response.refreshToken,
        });

        return response;
      }

      return rejectWithValue(response?.message || 'OTP verification failed');
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Verify OTP failed',
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await removeAuthSession();
      return true;
    } catch (err) {
      return rejectWithValue('Logout failed. Please try again.');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,

    sendOtpLoading: false,
    verifyOtpLoading: false,

    sendOtpError: null,
    verifyOtpError: null,

    isAuthChecked: false,
  },
  reducers: {
    clearAuth: state => {
      state.token = null;
      state.user = null;
      state.sendOtpLoading = false;
      state.verifyOtpLoading = false;
      state.sendOtpError = null;
      state.verifyOtpError = null;
      state.isAuthChecked = true;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(checkStoredToken.pending, state => {
        state.sendOtpError = null;
        state.verifyOtpError = null;
      })
      .addCase(checkStoredToken.fulfilled, (state, action) => {
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
        state.isAuthChecked = true; // Splash hatne ka signal
      })
      .addCase(checkStoredToken.rejected, state => {
        state.token = null;
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(sendOtp.pending, state => {
        state.sendOtpLoading = true;
        state.sendOtpError = null;
      })
      .addCase(sendOtp.fulfilled, state => {
        state.sendOtpLoading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.sendOtpLoading = false;
        state.sendOtpError = action.payload || 'Send OTP failed';
      })
      .addCase(verifyOtp.pending, state => {
        state.verifyOtpLoading = true;
        state.verifyOtpError = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const resolvedUser = action.payload?.user ?? action.payload?.data;

        state.verifyOtpLoading = false;
        state.token = action.payload?.token || null;
        state.user =
          resolvedUser && typeof resolvedUser === 'object'
            ? resolvedUser
            : null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload || 'Verify OTP failed';
      })
      .addCase(logoutUser.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.sendOtpLoading = false;
        state.verifyOtpLoading = false;
        state.sendOtpError = null;
        state.verifyOtpError = null;
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.rejected, state => {
        state.token = null;
        state.user = null;
        state.sendOtpLoading = false;
        state.verifyOtpLoading = false;
        state.sendOtpError = null;
        state.verifyOtpError = null;
        state.isAuthChecked = true;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
