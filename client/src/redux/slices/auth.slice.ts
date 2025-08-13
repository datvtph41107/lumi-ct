import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '~/services/api/auth.service';
import type { User, LoginCredentials, RegisterData } from '~/types/auth/auth.types';

// Types
export interface Permission {
  id: string;
  resource: string;
  action: string;
  display_name: string;
  conditions_schema?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  priority: number;
  permissions: Permission[];
}

export interface UserRole {
  id: string;
  role_id: string;
  scope: 'global' | 'department' | 'project' | 'contract';
  scope_id?: number;
  granted_by?: number;
  granted_at: string;
  expires_at?: string;
  role: Role;
}

export interface UserPermissions {
  userId: number;
  permissions: Permission[];
  roles: Role[];
  scopes: Record<string, any>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastActivity: number;
  idleTimeout: number;
  isIdleWarningShown: boolean;
  redirectPath: string | null;
  
  // Permission management
  userPermissions: UserPermissions | null;
  userRoles: UserRole[];
  permissionCache: Map<string, boolean>;
  isPermissionsLoaded: boolean;
}

interface LoginResponse {
  user: User;
  access_token: string;
  expires_in: number;
  permissions: UserPermissions;
  roles: UserRole[];
}

interface RefreshResponse {
  user: User;
  access_token: string;
  expires_in: number;
  permissions: UserPermissions;
  roles: UserRole[];
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastActivity: Date.now(),
  idleTimeout: 15 * 60 * 1000, // 15 minutes in milliseconds
  isIdleWarningShown: false,
  redirectPath: null,
  
  // Permission management
  userPermissions: null,
  userRoles: [],
  permissionCache: new Map(),
  isPermissionsLoaded: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Làm mới token thất bại');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

export const getUserPermissions = createAsyncThunk(
  'auth/getUserPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUserPermissions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy quyền hạn');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  }
);

export const updateActivity = createAsyncThunk(
  'auth/updateActivity',
  async (_, { rejectWithValue }) => {
    try {
      await authService.updateActivity();
      return Date.now();
    } catch (error: any) {
      return rejectWithValue('Không thể cập nhật hoạt động');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.sessionId = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isIdleWarningShown = false;
      state.userPermissions = null;
      state.userRoles = [];
      state.permissionCache.clear();
      state.isPermissionsLoaded = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
      state.isIdleWarningShown = false;
    },
    setIdleWarningShown: (state, action: PayloadAction<boolean>) => {
      state.isIdleWarningShown = action.payload;
    },
    setRedirectPath: (state, action: PayloadAction<string | null>) => {
      state.redirectPath = action.payload;
    },
    clearRedirectPath: (state) => {
      state.redirectPath = null;
    },
    setIdleTimeout: (state, action: PayloadAction<number>) => {
      state.idleTimeout = action.payload;
    },
    
    // Permission management
    setUserPermissions: (state, action: PayloadAction<UserPermissions>) => {
      state.userPermissions = action.payload;
      state.isPermissionsLoaded = true;
    },
    setUserRoles: (state, action: PayloadAction<UserRole[]>) => {
      state.userRoles = action.payload;
    },
    clearPermissionCache: (state) => {
      state.permissionCache.clear();
    },
    setPermissionCache: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.permissionCache.set(action.payload.key, action.payload.value);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.lastActivity = Date.now();
        state.isIdleWarningShown = false;
        state.userPermissions = action.payload.permissions;
        state.userRoles = action.payload.roles;
        state.isPermissionsLoaded = true;
        state.permissionCache.clear();
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.lastActivity = Date.now();
        state.isIdleWarningShown = false;
        state.userPermissions = action.payload.permissions;
        state.userRoles = action.payload.roles;
        state.isPermissionsLoaded = true;
        state.permissionCache.clear();
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<RefreshResponse>) => {
        state.isRefreshing = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.lastActivity = Date.now();
        state.isIdleWarningShown = false;
        state.userPermissions = action.payload.permissions;
        state.userRoles = action.payload.roles;
        state.isPermissionsLoaded = true;
        state.permissionCache.clear();
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload as string;
        // Auto logout on refresh failure
        state.user = null;
        state.accessToken = null;
        state.sessionId = null;
        state.isAuthenticated = false;
        state.userPermissions = null;
        state.userRoles = [];
        state.permissionCache.clear();
        state.isPermissionsLoaded = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.lastActivity = Date.now();
        state.isIdleWarningShown = false;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Auto logout on get current user failure
        state.user = null;
        state.accessToken = null;
        state.sessionId = null;
        state.isAuthenticated = false;
        state.userPermissions = null;
        state.userRoles = [];
        state.permissionCache.clear();
        state.isPermissionsLoaded = false;
      });

    // Get User Permissions
    builder
      .addCase(getUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserPermissions.fulfilled, (state, action: PayloadAction<{ permissions: UserPermissions; roles: UserRole[] }>) => {
        state.isLoading = false;
        state.userPermissions = action.payload.permissions;
        state.userRoles = action.payload.roles;
        state.isPermissionsLoaded = true;
        state.permissionCache.clear();
      })
      .addCase(getUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isPermissionsLoaded = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.sessionId = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isIdleWarningShown = false;
        state.userPermissions = null;
        state.userRoles = [];
        state.permissionCache.clear();
        state.isPermissionsLoaded = false;
      });

    // Update Activity
    builder
      .addCase(updateActivity.fulfilled, (state, action: PayloadAction<number>) => {
        state.lastActivity = action.payload;
        state.isIdleWarningShown = false;
      });
  },
});

// Export actions
export const {
  setAccessToken,
  setSessionId,
  clearAuth,
  setError,
  clearError,
  updateLastActivity,
  setIdleWarningShown,
  setRedirectPath,
  clearRedirectPath,
  setIdleTimeout,
  setUserPermissions,
  setUserRoles,
  clearPermissionCache,
  setPermissionCache,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isRefreshing;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectSessionId = (state: { auth: AuthState }) => state.auth.sessionId;
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;
export const selectIdleTimeout = (state: { auth: AuthState }) => state.auth.idleTimeout;
export const selectIsIdleWarningShown = (state: { auth: AuthState }) => state.auth.isIdleWarningShown;
export const selectRedirectPath = (state: { auth: AuthState }) => state.auth.redirectPath;

// Permission selectors
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.userPermissions;
export const selectUserRoles = (state: { auth: AuthState }) => state.auth.userRoles;
export const selectIsPermissionsLoaded = (state: { auth: AuthState }) => state.auth.isPermissionsLoaded;
export const selectPermissionCache = (state: { auth: AuthState }) => state.auth.permissionCache;

// Export reducer
export default authSlice.reducer;
