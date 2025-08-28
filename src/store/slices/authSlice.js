import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerCompany = createAsyncThunk(
  'auth/registerCompany',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.registerCompany(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      // Don't reject logout, always succeed
      console.error('Logout error:', error);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const initialState = {
  user: authService.getCurrentUser(),
  company: authService.getCurrentCompany(),
  subscription: authService.getCurrentSubscription(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.company = null;
      state.subscription = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.company = action.payload.company || null;
        state.subscription = action.payload.subscription || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.company = action.payload.company || null;
        state.subscription = action.payload.subscription || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.company = null;
        state.subscription = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.company = action.payload.company || null;
        state.subscription = action.payload.subscription || null;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.company) {
          localStorage.setItem('company', JSON.stringify(action.payload.company));
        }
        if (action.payload.subscription) {
          localStorage.setItem('subscription', JSON.stringify(action.payload.subscription));
        }
      });
  },
});

export const { clearError, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
