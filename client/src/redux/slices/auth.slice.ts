import { createApiSlice, createBaseApiState, type BaseApiState } from '~/core/http/api/createApiSlice';
import { AuthManager } from '~/core/http/settings/AuthManager';
import { SessionManager } from '~/core/http/settings/SessionManager';
import type { LoginResponse, UserResponse, SessionData } from '~/core/types/api.types';
import type { User } from '~/types/auth/auth.types';
import type { UserPermissions } from '~/types/auth/permissions.types';
import { authService } from '~/services/api/auth.service';

interface AuthState extends BaseApiState {
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

const initialState: AuthState = createBaseApiState({
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
});

const { slice, thunks, actions } = createApiSlice({
    name: 'auth',
    initialState,
    serviceThunks: {
        service: authService,
        methods: [
            authService.login,
            authService.getCurrentUser,
            authService.logout,
            authService.verifySession,
            authService.refreshToken,
            authService.updateActivity,
            authService.getUserPermissions,
        ],
    },
    disableDefaultHandlers: true,
    reducers: {
        clearAuth: (state) => {
            Object.assign(state, initialState); // reset initState
            AuthManager.getInstance().clearTokens();
        },
        setTokenRefreshing: (state, action) => {
            state.isTokenRefreshing = action.payload;
        },
        updateTokenExpiry: (state, action) => {
            state.tokenExpiry = action.payload;
        },
        updateLastActivity: (state) => {
            state.lastActivity = new Date().toISOString();
        },
        setSessionValid: (state, action) => {
            state.isSessionValid = action.payload;
        },
        restoreSession: (state, action) => {
            const { sessionId, isAuthenticated, tokenExpiry } = action.payload;
            state.sessionId = sessionId;
            state.isAuthenticated = isAuthenticated;
            state.isSessionValid = true;
            state.tokenExpiry = tokenExpiry;
            state.lastActivity = new Date().toISOString();
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
        },
        setRedirectPath: (state, action) => {
            state.redirectPath = action.payload;
        },
        clearRedirectPath: (state) => {
            state.redirectPath = null;
        },
        setPermissionCache: (state, action) => {
            const { key, value } = action.payload as { key: string; value: boolean };
            state.permissionCache[key] = value;
        },
        clearPermissionCache: (state) => {
            state.permissionCache = {};
        },
        setUserPermissions: (state, action) => {
            state.userPermissions = action.payload as UserPermissions;
            state.isPermissionsLoaded = true;
        },
        setIsPermissionsLoaded: (state, action) => {
            state.isPermissionsLoaded = action.payload as boolean;
        },
    },
    extraReducers: (builder, thunks) => {
        const { login, getCurrentUser, logout, verifySession, refreshToken, updateActivity, getUserPermissions } =
            thunks;
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                const response = action.payload as LoginResponse;
                state.loading = false;
                state.isAuthenticated = true;
                state.sessionId = response.sessionId as any;
                state.tokenExpiry = response.tokenExpiry as any;
                state.isSessionValid = true;
                state.lastActivity = new Date().toISOString();
                if ((response as any).user) {
                    state.user = (response as any).user;
                }
                if ((response as any).accessToken) {
                    state.accessToken = (response as any).accessToken;
                }
                AuthManager.getInstance().setAccessToken((response as any).accessToken, (response as any).sessionId);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.sessionId = null;
                state.isSessionValid = false;
            })
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                const response = action.payload as UserResponse;
                state.loading = false;
                state.user = response.userData as any;
                state.isAuthenticated = true;
                state.lastActivity = new Date().toISOString();
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                const errorMessage = action.payload as string;
                if (errorMessage?.includes('401') || errorMessage?.includes('unauthorized')) {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.sessionId = null;
                    state.isSessionValid = false;
                }
            })
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
            })
            .addCase(verifySession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifySession.fulfilled, (state, action) => {
                const response = action.payload as SessionData;
                state.loading = false;
                if ((response as any).isValid && (response as any).sessionId) {
                    state.sessionId = (response as any).sessionId;
                    state.isSessionValid = true;
                    state.lastActivity = (response as any).lastActivity || new Date().toISOString();
                    SessionManager.getInstance().setSessionId((response as any).sessionId);
                } else {
                    state.isSessionValid = false;
                    state.sessionId = null;
                }
            })
            .addCase(verifySession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isSessionValid = false;
                state.sessionId = null;
            })
            .addCase(refreshToken.pending, (state) => {
                state.isTokenRefreshing = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                const response = action.payload as LoginResponse;
                state.isTokenRefreshing = false;
                state.tokenExpiry = (response as any).tokenExpiry;
                state.sessionId = (response as any).sessionId;
                state.isSessionValid = true;
                state.lastActivity = new Date().toISOString();
                if ((response as any).accessToken) {
                    state.accessToken = (response as any).accessToken;
                    AuthManager.getInstance().setAccessToken(
                        (response as any).accessToken,
                        (response as any).sessionId,
                    );
                }
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isTokenRefreshing = false;
                state.error = action.payload as string;
                Object.assign(state, initialState);
                AuthManager.getInstance().clearTokens();
            })
            .addCase(updateActivity.fulfilled, (state) => {
                state.lastActivity = new Date().toISOString();
            })
            .addCase(getUserPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.userPermissions = action.payload as any;
                state.isPermissionsLoaded = true;
            })
            .addCase(getUserPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isPermissionsLoaded = false;
            });
    },
});

export const {
    clearError,
    setLoading,
    resetState,
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
} = actions;

export const { login, getCurrentUser, logout, verifySession, refreshToken, updateActivity, getUserPermissions } =
    thunks;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isTokenRefreshing;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectRedirectPath = (state: { auth: AuthState }) => state.auth.redirectPath;
export const selectIsPermissionsLoaded = (state: { auth: AuthState }) => state.auth.isPermissionsLoaded;
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.userPermissions;
export const selectUserRoles = (state: { auth: AuthState }) => state.auth.userPermissions?.roles || [];
export const selectPermissionCache = (state: { auth: AuthState }) => {
    return new Map<string, boolean>(Object.entries(state.auth.permissionCache || {}));
};

export type { UserPermissions };
export type { Permission, Role, UserRole } from '~/types/auth/permissions.types';

export default slice.reducer;
