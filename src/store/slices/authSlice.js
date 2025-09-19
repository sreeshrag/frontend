import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerCompany = createAsyncThunk(
  "auth/registerCompany",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.registerCompany(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      // Don't reject logout, always succeed
      console.error("Logout error:", error);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

const initialState = {
  user: authService.getCurrentUser(),
  company: authService.getCurrentCompany(),
  token: authService.getAccessToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.company = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    updateCompany: (state, action) => {
      state.company = { ...state.company, ...action.payload };
      localStorage.setItem("company", JSON.stringify(state.company));
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
        state.error = null;

        // ✅ Enhanced response handling with comprehensive validation
        const payload = action.payload;
        const responseData = payload?.data || payload;

        console.log("Redux: Processing login response:", responseData);

        // ✅ Validate user data before setting state
        if (!responseData?.user) {
          console.error("Redux: No user data in response:", payload);
          state.error = "Invalid login response - no user data";
          state.isAuthenticated = false;
          return;
        }

        if (!responseData.user.role) {
          console.error("Redux: No role in user data:", responseData.user);
          state.error = "Invalid user data - missing role";
          state.isAuthenticated = false;
          return;
        }

        // ✅ Safe state updates
        state.user = responseData.user;
        state.company = responseData.company || null;
        state.token = responseData.tokens?.accessToken || null;
        state.isAuthenticated = true;

        // ✅ Log permissions for debugging
        if (state.company?.permissions) {
          console.log(
            "Redux: Company permissions loaded:",
            state.company.permissions.length
          );
        }

        // ✅ Update localStorage safely
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
          if (state.company) {
            localStorage.setItem("company", JSON.stringify(state.company));
          }
          if (state.token) {
            localStorage.setItem("accessToken", state.token);
          }
          if (responseData.tokens?.refreshToken) {
            localStorage.setItem(
              "refreshToken",
              responseData.tokens.refreshToken
            );
          }
        } catch (storageError) {
          console.error("Redux: LocalStorage error:", storageError);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.company = null;
        state.token = null;
      })

      // Register
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // ✅ Handle registration response with validation
        const payload = action.payload;
        const responseData = payload?.data || payload;

        if (!responseData?.user) {
          console.error("Redux: No user data in registration response");
          state.error = "Invalid registration response";
          state.isAuthenticated = false;
          return;
        }

        state.user = responseData.user;
        state.company = responseData.company || null;
        state.token = responseData.tokens?.accessToken || null;
        state.isAuthenticated = true;

        // Update localStorage
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
          if (state.company) {
            localStorage.setItem("company", JSON.stringify(state.company));
          }
          if (state.token) {
            localStorage.setItem("accessToken", state.token);
          }
          if (responseData.tokens?.refreshToken) {
            localStorage.setItem(
              "refreshToken",
              responseData.tokens.refreshToken
            );
          }
        } catch (storageError) {
          console.error(
            "Redux: LocalStorage error during registration:",
            storageError
          );
        }
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.company = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;

        // ✅ Clear localStorage
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("company");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (storageError) {
          console.error("Redux: LocalStorage clear error:", storageError);
        }
      })

      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Handle profile response structure
        const payload = action.payload;
        const responseData = payload?.data || payload;

        if (responseData?.user) {
          state.user = responseData.user;
        }
        if (responseData?.company) {
          state.company = responseData.company;
        }

        console.log(
          "Redux: Profile updated with permissions:",
          state.company?.permissions?.length || 0
        );

        // Update localStorage
        try {
          if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
          }
          if (state.company) {
            localStorage.setItem("company", JSON.stringify(state.company));
          }
        } catch (storageError) {
          console.error(
            "Redux: LocalStorage error during profile update:",
            storageError
          );
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear auth on profile fetch failure
      });
  },
});

export const { clearError, clearAuth, updateUser, updateCompany } =
  authSlice.actions;
export default authSlice.reducer;
