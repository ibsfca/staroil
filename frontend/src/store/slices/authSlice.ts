import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';
import { mockDemoUser } from '../../mocks/data';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  stationId?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: mockDemoUser as any,
  accessToken: 'demo-token',
  refreshToken: 'demo-refresh-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, accessToken, refreshToken };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  return null;
});

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      return rejectWithValue('No session found');
    }

    try {
      // Verify token is still valid
      const response = await apiClient.get('/auth/me');
      return {
        user: response.data.user,
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken'),
      };
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue('Session expired');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        return rejectWithValue('No refresh token');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      return { accessToken };
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue('Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
