import type { ApiConfig, AuthConfig } from '../../types/api.types';

export class ConfigManager {
    private static instance: ConfigManager;
    private apiConfig: ApiConfig;
    private authConfig: AuthConfig;
    private BASE_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3001/api/v1';
    private constructor() {
        this.apiConfig = {
            baseURL: this.BASE_URL,
            timeout: 10000,
            enableLogging: import.meta.env.NODE_ENV === 'dev',
        };

        this.authConfig = {
            loginEndpoint: 'auth/login',
            refreshEndpoint: 'auth/refresh-token',
            logoutEndpoint: 'auth/logout',
        };
    }

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    getApiConfig(): ApiConfig {
        return { ...this.apiConfig };
    }

    getAuthConfig(): AuthConfig {
        return { ...this.authConfig };
    }
}
