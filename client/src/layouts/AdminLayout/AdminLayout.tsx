import { type FC, type ReactNode } from "react";

const AdminLayout: FC<{ children: ReactNode }> = ({ children }) => {
    return <div>{children}</div>;
};

export default AdminLayout;
