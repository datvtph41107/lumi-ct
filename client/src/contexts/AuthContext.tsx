import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, LoginRequest, LoginResponse } from '~/types/auth/auth.types';
import { authService } from '~/services/api/auth.service';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null,
            };
        default:
            return state;
    }
};

interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const response = await authService.login(credentials);
            
            if (response.success) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
                // Store token in localStorage or secure storage
                localStorage.setItem('accessToken', response.data.accessToken);
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Login failed' });
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } catch (error) {
            // Ignore logout errors
        } finally {
            dispatch({ type: 'LOGOUT' });
            localStorage.removeItem('accessToken');
        }
    };

    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const updateUser = (userData: Partial<User>): void => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    dispatch({ type: 'LOGIN_START' });
                    const response = await authService.getCurrentUser();
                    if (response.success) {
                        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
                    } else {
                        dispatch({ type: 'LOGOUT' });
                        localStorage.removeItem('accessToken');
                    }
                } catch (error) {
                    dispatch({ type: 'LOGOUT' });
                    localStorage.removeItem('accessToken');
                }
            }
        };

        checkAuth();
    }, []);

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        clearError,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
