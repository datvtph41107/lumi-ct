import { authService } from '~/services/api/auth.service';
import type { User, LoginCredentials, RegisterData } from '~/types/auth/auth.types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthCallbacks {
    onLogin?: (user: User) => void;
    onLogout?: () => void;
    onError?: (error: string) => void;
    onTokenRefresh?: (user: User) => void;
}

class AuthManager {
    private static instance: AuthManager;
    private state: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    };
    private callbacks: AuthCallbacks = {};
    private refreshTimeout: NodeJS.Timeout | null = null;

    private constructor() {
        this.initializeAuth();
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    private async initializeAuth(): Promise<void> {
        try {
            this.setState({ isLoading: true });
            const response = await authService.getCurrentUser();
            this.setState({
                user: response.data,
                isAuthenticated: true,
                isLoading: false
            });
            this.scheduleTokenRefresh();
        } catch (error) {
            this.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    }

    public async login(credentials: LoginCredentials): Promise<User> {
        try {
            this.setState({ isLoading: true, error: null });
            const response = await authService.login(credentials);
            const user = response.data.user;
            
            this.setState({
                user,
                isAuthenticated: true,
                isLoading: false
            });

            this.scheduleTokenRefresh();
            this.callbacks.onLogin?.(user);
            
            return user;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
            this.setState({ error: errorMessage, isLoading: false });
            this.callbacks.onError?.(errorMessage);
            throw error;
        }
    }

    public async register(data: RegisterData): Promise<User> {
        try {
            this.setState({ isLoading: true, error: null });
            const response = await authService.register(data);
            const user = response.data.user;
            
            this.setState({
                user,
                isAuthenticated: true,
                isLoading: false
            });

            this.scheduleTokenRefresh();
            this.callbacks.onLogin?.(user);
            
            return user;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
            this.setState({ error: errorMessage, isLoading: false });
            this.callbacks.onError?.(errorMessage);
            throw error;
        }
    }

    public async logout(): Promise<void> {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    public async refreshToken(): Promise<User | null> {
        try {
            const response = await authService.refreshToken();
            const user = response.data.user;
            
            this.setState({
                user,
                isAuthenticated: true
            });

            this.scheduleTokenRefresh();
            this.callbacks.onTokenRefresh?.(user);
            
            return user;
        } catch (error) {
            this.clearAuth();
            return null;
        }
    }

    private clearAuth(): void {
        this.setState({
            user: null,
            isAuthenticated: false,
            error: null
        });
        
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
        
        this.callbacks.onLogout?.();
    }

    private scheduleTokenRefresh(): void {
        // Schedule token refresh 5 minutes before expiry
        // For now, we'll refresh every 25 minutes (assuming 30-minute token expiry)
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        
        this.refreshTimeout = setTimeout(() => {
            this.refreshToken();
        }, 25 * 60 * 1000); // 25 minutes
    }

    private setState(updates: Partial<AuthState>): void {
        this.state = { ...this.state, ...updates };
        this.notifyStateChange();
    }

    private notifyStateChange(): void {
        // Notify any listeners about state changes
        window.dispatchEvent(new CustomEvent('auth:state-change', {
            detail: this.state
        }));
    }

    public getState(): AuthState {
        return { ...this.state };
    }

    public getUser(): User | null {
        return this.state.user;
    }

    public isAuthenticated(): boolean {
        return this.state.isAuthenticated;
    }

    public isLoading(): boolean {
        return this.state.isLoading;
    }

    public getError(): string | null {
        return this.state.error;
    }

    public clearError(): void {
        this.setState({ error: null });
    }

    public setCallbacks(callbacks: AuthCallbacks): void {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    public hasRole(role: string): boolean {
        return this.state.user?.role === role;
    }

    public hasAnyRole(roles: string[]): boolean {
        return this.state.user ? roles.includes(this.state.user.role) : false;
    }

    public isAdmin(): boolean {
        return this.hasRole('admin');
    }

    public isManager(): boolean {
        return this.hasRole('manager');
    }

    public isUser(): boolean {
        return this.hasRole('user');
    }
}

export default AuthManager;