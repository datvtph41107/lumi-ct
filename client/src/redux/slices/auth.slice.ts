import { createApiSlice, createBaseApiState, type BaseApiState } from "~/core/http/api/createApiSlice";
import { AuthManager } from "~/core/http/settings/AuthManager";
import { SessionManager } from "~/core/http/settings/SessionManager";
import type { LoginResponse, UserResponse, SessionData } from "~/core/types/api.types";
import type { User } from "~/types/auth.types";
import { authService } from "~/services/api/auth.service";

interface AuthState extends BaseApiState {
    user: User | null;
    isAuthenticated: boolean;
    // Session management
    sessionId: string | null;
    lastActivity: string | null;
    isSessionValid: boolean;
    // Token management
    tokenExpiry: number | null;
    isTokenRefreshing: boolean;
}

const initialState: AuthState = createBaseApiState({
    user: null,
    isAuthenticated: false,
    sessionId: null,
    lastActivity: null,
    isSessionValid: false,
    tokenExpiry: null,
    isTokenRefreshing: false,
});

const { slice, thunks, actions } = createApiSlice({
    name: "auth",
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
    },
    extraReducers: (builder, thunks) => {
        const { login, getCurrentUser, logout, verifySession, refreshToken, updateActivity } = thunks;
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
                    state.user = response.user;
                }
                AuthManager.getInstance().setAccessToken(response.accessToken, response.sessionId);
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
                state.user = response.userData;
                state.isAuthenticated = true;
                state.lastActivity = new Date().toISOString();
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                const errorMessage = action.payload as string;
                if (errorMessage?.includes("401") || errorMessage?.includes("unauthorized")) {
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
                // Clear state even if API fails
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
                state.tokenExpiry = response.tokenExpiry;
                state.sessionId = response.sessionId;
                state.isSessionValid = true;
                state.lastActivity = new Date().toISOString();
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isTokenRefreshing = false;
                state.error = action.payload as string;
                Object.assign(state, initialState);
                AuthManager.getInstance().clearTokens();
            })
            .addCase(updateActivity.fulfilled, (state) => {
                state.lastActivity = new Date().toISOString();
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
} = actions;

export const { login, getCurrentUser, logout, verifySession, refreshToken, updateActivity } = thunks;

export default slice.reducer;
