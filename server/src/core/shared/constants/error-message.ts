export const ERROR_MESSAGES = {
    FILE: {
        NOT_FOUND: 'No file was uploaded.',
        ALREADY_EXISTS: 'Files already exists.',
        DUPLICATES: 'Files already exist in another contract.',
        REQUIED: 'At least one file is required.',
    },
    CONTRACT: {
        NOT_FOUND: 'Contract not found.',
        NAME_EXISTS: 'This contract name already exists.',
    },
    TOKEN: {
        INVALID: 'Invalid token',
        EXPIRED: 'Token has expired',
        MISSING: 'Token is missing',
        REVOKED: 'Token has been revoked',
    },
    AUTH: {
        UNAUTHORIZED: 'Unauthorized access.',
        FORBIDDEN: 'You do not have permission to perform this action.',
    },
    DEPARTMENT: {
        NOT_FOUND: 'Department does not exist',
    },
    MANAGER: {
        ALREADY_EXIST: 'Manager already exist in the department',
    },
    COMMON: {
        BAD_REQUEST: 'Invalid request.',
        INTERNAL_ERROR: 'Internal server error.',
    },
};
