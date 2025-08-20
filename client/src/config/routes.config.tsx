type DynamicRoute = {
    (id: string | number): string;
    path: string;
};

const dynamicRoute = (path: string, build: (id: string | number) => string): DynamicRoute => {
    const fn = ((id: string | number) => build(id)) as DynamicRoute;
    fn.path = path;
    return fn;
};

export const routes = {
    login: '/login',
    adminLogin: '/admin/login',
};

export const routePrivate = {
    dashboard: '/',

    admin: '/admin',
    adminStaffs: '/admin/staffs',
    adminContracts: '/admin/contracts',
    adminNotifications: '/admin/notifications',
    adminSettings: '/admin/settings',

    // Vừa có path, vừa có function build url
    adminUserDetail: dynamicRoute('/admin/staffs/:id', (id) => `/admin/staffs/${id}`),

    createContract: '/contracts/create',
    ContractCollection: '/contracts/collection',
    contract: '/page/create/daft',
    contractPages: '/contracts',
    contractTypes: '/contracts/type',

    contractDetail: dynamicRoute('/contracts/:id', (id) => `/contracts/${id}`),

    // Template management
    templates: '/templates',
    templateDetail: dynamicRoute('/templates/:id', (id) => `/templates/${id}`),
};
