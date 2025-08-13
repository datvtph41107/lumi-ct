import axios from "axios";
import { ConfigManager } from "./ConfigManager";
import { SessionManager } from "./SessionManager";

export class AuthManager {
    private static instance: AuthManager;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;
    private sessionManager: SessionManager;

    private constructor() {
        this.sessionManager = SessionManager.getInstance();
    }

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    setAccessToken(token: string, sessionId?: string): void {
        this.accessToken = token;
        this.tokenExpiry = this.decodeTokenExpiry(token);

        if (sessionId) {
            this.sessionManager.setSessionId(sessionId);
            this.sessionManager.broadcastLogin(sessionId);
        }
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    getTokenExpiry(): number | null {
        return this.tokenExpiry;
    }

    clearTokens(): void {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.sessionManager.clearSession();
        this.sessionManager.broadcastLogout();
    }

    public async ensureValidToken(): Promise<string | null> {
        const now = Math.floor(Date.now() / 1000);
        console.log("[AuthManager] Checking token validity", { tokenExpiry: this.tokenExpiry, now });

        // Nếu token quá hạn hơn 5 phút → không refresh
        if (this.tokenExpiry && now > this.tokenExpiry + 5 * 60) {
            console.warn("[AuthManager] Token quá hạn → không tự refresh");
            this.clearTokens();
            return null;
        }

        // Token còn hạn > 30s → return
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > now + 30) {
            console.log("[AuthManager] Token is valid");
            return this.accessToken;
        }

        console.log("[AuthManager] Token is invalid or expired, refreshing...");
        return this.refreshAccessToken();
    }

    public async refreshAccessToken(): Promise<string | null> {
        const config = ConfigManager.getInstance().getApiConfig();
        const authConfig = ConfigManager.getInstance().getAuthConfig();

        try {
            console.log("[AuthManager] Sending refresh request");
            const res = await axios.post(
                `${config.baseURL}${authConfig.refreshEndpoint}`,
                {},
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                    timeout: config.timeout,
                },
            );

            console.log("[AuthManager] Refresh response received", res.data);
            const { data } = res;

            if (!data?.data?.accessToken) {
                console.error("[AuthManager] Access token missing in response");
                throw new Error("Access token missing");
            }

            // ✅ Set token với session ID
            this.setAccessToken(data.data.accessToken, data.data.sessionId);
            this.tokenExpiry = data.data.tokenExpiry;

            console.log("[AuthManager] New token set", {
                tokenExpiry: this.tokenExpiry,
                sessionId: data.data.sessionId,
            });

            return data.data.accessToken;
        } catch (err) {
            console.error("[AuthManager] Refresh token failed", err);
            this.clearTokens();
            throw err;
        }
    }

    // ✅ Method để verify session với backend
    public async verifySession(): Promise<boolean> {
        const config = ConfigManager.getInstance().getApiConfig();

        try {
            const res = await axios.get(`${config.baseURL}auth/verify-session`, {
                withCredentials: true,
                timeout: config.timeout,
            });

            const { data } = res;

            if (data?.data?.isValid && data?.data?.sessionId) {
                this.sessionManager.setSessionId(data.data.sessionId);
                return true;
            }

            return false;
        } catch (error) {
            console.error("[AuthManager] Session verification failed", error);
            return false;
        }
    }

    private decodeTokenExpiry(token: string): number | null {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp;
        } catch {
            return null;
        }
    }
}
