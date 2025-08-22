export type Permission = string; // same shape as server: `${resource}.${action}` or `*`

export interface AclState {
    grants: Permission[];
}

// accessControllList
export const createAcl = (initial: AclState) => {
    const state: AclState = { ...initial };

    const setGrants = (grants: Permission[]) => {
        state.grants = grants;
    };

    const has = (perm: Permission) => {
        return state.grants?.includes('*') || state.grants?.includes(perm) || false;
    };

    const can = (resource: string, action: string) => has(`${resource}.${action}`);

    return {
        setGrants,
        has,
        can,
        get grants() {
            return state.grants;
        },
    };
};

// Ví dụ: "user.create", "contract.approve", hoặc "*" (all access)
