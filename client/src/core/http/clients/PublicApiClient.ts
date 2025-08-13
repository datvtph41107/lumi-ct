import { BaseApiClient } from "./BaseApiClient";

export class PublicApiClient extends BaseApiClient {
    protected setupInterceptors(): void {
        this.instance.interceptors.request.use(
            (config) => {
                config.headers["Content-Type"] = "application/json";
                config.headers["Accept"] = "application/json";

                this.logger.request?.(config); // Optional logger
                return config;
            },
            (error) => Promise.reject(error),
        );

        this.instance.interceptors.response.use(
            (response) => {
                this.logger.response?.(response); // Optional logger
                return response;
            },
            (error) => {
                return Promise.reject(this.error?.(error) ?? error);
            },
        );
    }
}
