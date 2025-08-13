import { useState, useEffect, type ReactNode, type FC } from "react";
import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";

const cx = classNames.bind(styles);

const DefaultLayout: FC<{ children: ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showChildren, setShowChildren] = useState(true);
    const location = useLocation();

    // Get page title based on current route
    const getPageTitle = () => {
        switch (location.pathname) {
            case "/dashboard":
                return "Dashboard";
            case "/contract-pages":
                return "Quản lý hợp đồng";
            case "/create-contract":
                return "Tạo hợp đồng";
            default:
                return "Dashboard";
        }
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        const handleMediaChange = (e: MediaQueryListEvent) => {
            setCollapsed(e.matches);
            setShowChildren(!e.matches);
        };

        setCollapsed(mediaQuery.matches);
        setShowChildren(!mediaQuery.matches);

        mediaQuery.addEventListener("change", handleMediaChange);
        return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }, []);

    const handleToggleSidebar = () => {
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => setShowChildren(true), 150);
        } else {
            setShowChildren(false);
            setTimeout(() => setCollapsed(true), 100);
        }
    };

    return (
        <div className={cx("layout")}>
            <aside className={cx("sidebar", { collapsed })}>
                <Sidebar collapsed={collapsed} showChildren={showChildren} onToggle={handleToggleSidebar} />
            </aside>
            <div className={cx("main", { collapsed })}>
                <div className={cx("main-board")}>
                    <header className={cx("header")}>
                        <div>
                            <h1 className={cx("page-title")}>{getPageTitle()}</h1>
                        </div>
                        <p>Last updated 24 minutes ago</p>
                    </header>
                    <main className={cx("content")}>{children}</main>
                </div>
            </div>
        </div>
    );
};

export default DefaultLayout;
