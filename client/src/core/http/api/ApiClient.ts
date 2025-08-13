import { PublicApiClient } from "~/core/http/clients/PublicApiClient";
import { PrivateApiClient } from "~/core/http/clients/PrivateApiClient";

export class ApiClient {
    private static instance: ApiClient;

    public readonly public: PublicApiClient;
    public readonly private: PrivateApiClient;

    private constructor() {
        this.public = new PublicApiClient();
        this.private = new PrivateApiClient();
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }
}
