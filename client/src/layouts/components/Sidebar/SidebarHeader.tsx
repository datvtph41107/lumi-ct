import { TbLayoutSidebarLeftCollapseFilled, TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

const cx = classNames.bind(styles);

type SidebarHeaderProps = {
    collapsed: boolean;
    onToggle: () => void;
};

const SidebarHeader = ({ collapsed, onToggle }: SidebarHeaderProps) => {
    const [showToggle, setShowToggle] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setShowToggle(window.innerWidth > 768);
        }
    }, []);

    return (
        <div className={cx("header-group")}>
            <div className={cx("header")}>
                <div className={cx("header-box")}>P</div>
                <div className={cx("header-detail")}>
                    <p className={cx("header-detail-name")}>Nguyễn Văn P</p>
                    <span className={cx("header-detail-dep")}>Trưởng phòng hành chính</span>
                </div>
            </div>
            {showToggle && (
                <div className={cx("header-collapse")} onClick={onToggle}>
                    {collapsed ? <TbLayoutSidebarRightCollapseFilled /> : <TbLayoutSidebarLeftCollapseFilled />}
                </div>
            )}
        </div>
    );
};

export default SidebarHeader;
