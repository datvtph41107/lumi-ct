// 📁 components/sidebar/SidebarFooter.tsx
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

const cx = classNames.bind(styles);

type SidebarFooterProps = {
    collapsed: boolean;
};

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => (
    <div className={cx("footer")}>
        {!collapsed ? (
            <div className={cx("footer-ds")}>
                <p>Send feedback</p>
                <p>Documentation</p>
                <p>Status</p>
                <p className={cx("branding")}>11 ⬤ oneleet</p>
            </div>
        ) : (
            <p className={cx("branding")}>11 ⬤ oneleet</p>
        )}
    </div>
);

export default SidebarFooter;
