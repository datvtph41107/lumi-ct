import { BaseApiClient } from "./BaseApiClient";
import { AuthManager } from "../settings/AuthManager";
import { SessionManager } from "../settings/SessionManager";

export class PrivateApiClient extends BaseApiClient {
    constructor() {
        super();
        this.setupInterceptors();
    }

    protected setupInterceptors(): void {
        this.instance.interceptors.request.use(
            async (config) => {
                const authManager = AuthManager.getInstance();
                const sessionManager = SessionManager.getInstance();

                try {
                    const token = await authManager.ensureValidToken();
                    if (!token) {
                        console.warn("[PrivateApi] No valid token in request");
                        window.dispatchEvent(new CustomEvent("auth:logout"));
                        throw new Error("Unauthorized: Missing access token");
                    }

                    if (config.headers) {
                        config.headers["Authorization"] = `Bearer ${token}`;
                    }

                    sessionManager.trackApiActivity();
                    return config;
                } catch (error) {
                    console.error("[PrivateApi] Failed to get access token:", error);
                    window.dispatchEvent(new CustomEvent("auth:logout"));
                    throw error;
                }
            },
            (error) => Promise.reject(error),
        );

        this.instance.interceptors.response.use(
            (response) => {
                SessionManager.getInstance().trackApiActivity();
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const authManager = AuthManager.getInstance();
                        const newToken = await authManager.refreshAccessToken();

                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            // ✅ Track API activity after successful refresh
                            SessionManager.getInstance().trackApiActivity();
                            return this.instance(originalRequest);
                        }

                        authManager.clearTokens();
                        window.dispatchEvent(new CustomEvent("auth:logout"));
                    } catch (refreshError) {
                        console.error("[PrivateApi] Token refresh failed:", refreshError);
                        AuthManager.getInstance().clearTokens();
                        window.dispatchEvent(new CustomEvent("auth:logout"));
                    }
                }

                return Promise.reject(error);
            },
        );
    }
}
