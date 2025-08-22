export type Permission = string; // same shape as server: `${resource}.${action}` or `*`

export interface AclState {
	grants: Permission[];
}

export const createAcl = (initial: AclState) => {
	let state: AclState = { ...initial };

	const setGrants = (grants: Permission[]) => {
		state.grants = grants;
	};

	const has = (perm: Permission) => {
		return state.grants?.includes('*') || state.grants?.includes(perm) || false;
	};

	const can = (resource: string, action: string) => has(`${resource}.${action}`);

	return { setGrants, has, can, get grants() { return state.grants; } };
};