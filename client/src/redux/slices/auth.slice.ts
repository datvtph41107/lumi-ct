import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AuthManager } from '~/core/http/settings/AuthManager';
import { SessionManager } from '~/core/http/settings/SessionManager';
import { authService } from '~/services/api/auth.service';
import type { User, LoginRequest } from '~/types/auth/auth.types';
type UserPermissions = { capabilities: { grants: string[] } };
import type { LoginResponse, RefreshTokenResponse, SessionData } from '~/core/types/api.types';

// ===== Thunks (standard RTK) =====
export const login = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
    'auth/login',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await authService.login(payload);
            return res.data as LoginResponse;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            return rejectWithValue(message);
        }
    },
);

// Shape returned by /auth/me (HeaderUserPayload)
type MePayload = {
    sub: number;
    username: string;
    roles?: string[];
    department?: { id: number; name: string; code: string } | null;
    permissions?: unknown;
};

export const getCurrentUser = createAsyncThunk<MePayload, void, { rejectValue: string }>(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const res = await authService.getCurrentUser();
            return res.data as unknown as MePayload;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Fetch current user failed';
            return rejectWithValue(message);
        }
    },
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            return rejectWithValue(message);
        }
    },
);

export const verifySession = createAsyncThunk<SessionData, void, { rejectValue: string }>(
    'auth/verifySession',
    async (_, { rejectWithValue }) => {
        try {
            const res = await authService.verifySession();
            return res.data as SessionData;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Verify session failed';
            return rejectWithValue(message);
        }
    },
);

export const refreshToken = createAsyncThunk<RefreshTokenResponse, void, { rejectValue: string }>(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const res = await authService.refreshToken();
            return res.data as RefreshTokenResponse;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Refresh token failed';
            return rejectWithValue(message);
        }
    },
);

export const updateActivity = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/updateActivity',
    async (_, { rejectWithValue }) => {
        try {
            await authService.updateActivity();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Update activity failed';
            return rejectWithValue(message);
        }
    },
);

export const getUserPermissions = createAsyncThunk<UserPermissions, void, { rejectValue: string }>(
    'auth/getUserPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const res = await authService.getUserPermissions();
            return res.data as UserPermissions;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Get permissions failed';
            return rejectWithValue(message);
        }
    },
);

// ===== State & Slice =====
interface AuthState {
    loading: boolean;
    error: string | null;
    user: User | null;
    isAuthenticated: boolean;
    // Session management
    sessionId: string | null;
    lastActivity: string | null;
    isSessionValid: boolean;
    // Token management
    accessToken: string | null;
    tokenExpiry: number | null;
    isTokenRefreshing: boolean;
    // Permissions
    userPermissions: UserPermissions | null;
    isPermissionsLoaded: boolean;
    permissionCache: Record<string, boolean>;
    // Redirect
    redirectPath: string | null;
}

const initialState: AuthState = {
    loading: false,
    error: null,
    user: null,
    isAuthenticated: false,
    sessionId: null,
    lastActivity: null,
    isSessionValid: false,
    accessToken: null,
    tokenExpiry: null,
    isTokenRefreshing: false,
    userPermissions: null,
    isPermissionsLoaded: false,
    permissionCache: {},
    redirectPath: null,
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuth: (state) => {
            Object.assign(state, initialState);
            AuthManager.getInstance().clearTokens();
        },
        setTokenRefreshing: (state, action: PayloadAction<boolean>) => {
            state.isTokenRefreshing = action.payload;
        },
        updateTokenExpiry: (state, action: PayloadAction<number | null>) => {
            state.tokenExpiry = action.payload;
        },
        updateLastActivity: (state) => {
            state.lastActivity = new Date().toISOString();
        },
        setSessionValid: (state, action: PayloadAction<boolean>) => {
            state.isSessionValid = action.payload;
        },
        restoreSession: (
            state,
            action: PayloadAction<{ sessionId: string | null; isAuthenticated: boolean; tokenExpiry: number | null }>,
        ) => {
            const { sessionId, isAuthenticated, tokenExpiry } = action.payload;
            state.sessionId = sessionId;
            state.isAuthenticated = isAuthenticated;
            state.isSessionValid = true;
            state.tokenExpiry = tokenExpiry;
            state.lastActivity = new Date().toISOString();
        },
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
        setSessionId: (state, action: PayloadAction<string | null>) => {
            state.sessionId = action.payload;
        },
        setRedirectPath: (state, action: PayloadAction<string | null>) => {
            state.redirectPath = action.payload;
        },
        clearRedirectPath: (state) => {
            state.redirectPath = null;
        },
        setPermissionCache: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
            const { key, value } = action.payload;
            state.permissionCache[key] = value;
        },
        clearPermissionCache: (state) => {
            state.permissionCache = {};
        },
        setUserPermissions: (state, action: PayloadAction<UserPermissions | null>) => {
            state.userPermissions = action.payload;
            state.isPermissionsLoaded = !!action.payload;
        },
        setIsPermissionsLoaded: (state, action: PayloadAction<boolean>) => {
            state.isPermissionsLoaded = action.payload;
        },
    },
    extraReducers: (builder) => {
        // login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                const response = action.payload as LoginResponse;
                state.loading = false;
                state.isAuthenticated = true;
                state.sessionId = response.sessionId;
                state.tokenExpiry = response.tokenExpiry;
                state.isSessionValid = true;
                state.lastActivity = new Date().toISOString();
                if (response.user) {
                    state.user = response.user as User;
                }
                if (response.accessToken) {
                    state.accessToken = response.accessToken;
                }
                AuthManager.getInstance().setAccessToken(response.accessToken, response.sessionId);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Login failed';
                state.isAuthenticated = false;
                state.sessionId = null;
                state.isSessionValid = false;
            });

        // getCurrentUser
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                const payload = action.payload as MePayload;
                state.loading = false;
                state.isAuthenticated = true;
                state.lastActivity = new Date().toISOString();
                const mapped: User = {
                    id: payload.sub,
                    name: payload.username,
                    username: payload.username,
                    role: (payload.roles && payload.roles[0]) || 'STAFF',
                    status: 'active',
                    department: payload.department || null,
                    permissions: {
                        create_contract: false,
                        create_report: false,
                        read: true,
                        update: true,
                        delete: false,
                        approve: false,
                        assign: false,
                    },
                } as User;
                state.user = mapped;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Get current user failed';
                state.isAuthenticated = false;
                state.user = null;
                state.sessionId = null;
                state.isSessionValid = false;
            });

        // logout
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                Object.assign(state, initialState);
                AuthManager.getInstance().clearTokens();
            })
            .addCase(logout.rejected, (state) => {
                Object.assign(state, initialState);
                AuthManager.getInstance().clearTokens();
            });

        // verifySession
        builder
            .addCase(verifySession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifySession.fulfilled, (state, action) => {
                const response = action.payload as SessionData;
                state.loading = false;
                if (response.isValid && response.sessionId) {
                    state.sessionId = response.sessionId;
                    state.isSessionValid = true;
                    state.lastActivity = response.lastActivity || new Date().toISOString();
                    SessionManager.getInstance().setSessionId(response.sessionId);
                } else {
                    state.isSessionValid = false;
                    state.sessionId = null;
                }
            })
            .addCase(verifySession.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Verify session failed';
                state.isSessionValid = false;
                state.sessionId = null;
            });

        // refreshToken
        builder
            .addCase(refreshToken.pending, (state) => {
                state.isTokenRefreshing = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                const response = action.payload as RefreshTokenResponse;
                state.isTokenRefreshing = false;
                state.tokenExpiry = response.tokenExpiry;
                state.sessionId = response.sessionId;
                state.isSessionValid = true;
                state.lastActivity = new Date().toISOString();
                if (response.accessToken) {
                    state.accessToken = response.accessToken;
                    AuthManager.getInstance().setAccessToken(response.accessToken, response.sessionId);
                }
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isTokenRefreshing = false;
                state.error = (action.payload as string) || 'Refresh token failed';
                Object.assign(state, initialState);
                AuthManager.getInstance().clearTokens();
            });

        // updateActivity
        builder.addCase(updateActivity.fulfilled, (state) => {
            state.lastActivity = new Date().toISOString();
        });

        // getUserPermissions
        builder
            .addCase(getUserPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.userPermissions = action.payload as UserPermissions;
                state.isPermissionsLoaded = true;
            })
            .addCase(getUserPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Get permissions failed';
                state.isPermissionsLoaded = false;
            });
    },
});

export const {
    clearAuth,
    setTokenRefreshing,
    updateTokenExpiry,
    updateLastActivity,
    setSessionValid,
    restoreSession,
    setAccessToken,
    setSessionId,
    setRedirectPath,
    clearRedirectPath,
    setPermissionCache,
    clearPermissionCache,
    setUserPermissions,
    setIsPermissionsLoaded,
} = slice.actions;

export default slice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isTokenRefreshing;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectRedirectPath = (state: { auth: AuthState }) => state.auth.redirectPath;
export const selectIsPermissionsLoaded = (state: { auth: AuthState }) => state.auth.isPermissionsLoaded;
export const selectUserRoles = (state: { auth: AuthState }) => state.auth.userPermissions?.capabilities.grants || [];
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.userPermissions;
export const selectPermissionCache = (state: { auth: AuthState }) => {
    return new Map<string, boolean>(Object.entries(state.auth.permissionCache || {}));
};

export type { UserPermissions };
