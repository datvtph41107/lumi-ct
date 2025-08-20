export type UserPermissions = {
    roles?: string[];
    capabilities: {
        is_manager: boolean;
    };
};
