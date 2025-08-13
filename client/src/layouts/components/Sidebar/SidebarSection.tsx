// 📁 components/sidebar/SidebarSection.tsx
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import Popup from "~/components/Popup";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

const cx = classNames.bind(styles);

type SectionItem = {
    label: string;
    path?: string;
};

type SidebarSectionProps = {
    item: {
        section: string;
        icon?: React.ElementType;
        items: SectionItem[];
    };
    collapsed: boolean;
    location: ReturnType<typeof useLocation>;
    openSections: string[];
    toggleSection: (section: string) => void;
    activeLabel: string | null;
    showNotifModal: boolean;
    handleActiveLabel: (label: string, hasPath?: boolean) => void;
};

const SidebarSection = ({
    item,
    collapsed,
    location,
    openSections,
    toggleSection,
    activeLabel,
    showNotifModal,
    handleActiveLabel,
}: SidebarSectionProps) => {
    const isOpen = openSections.includes(item.section);

    return (
        <div className={cx("section-group")}>
            <div className={cx("section-title-wrapper")}>
                {collapsed ? (
                    <Popup
                        trigger="click"
                        offsetValue={{ mainAxis: 20, crossAxis: 40 }}
                        placement="right"
                        content={
                            <div className={cx("popup-content-list")}>
                                <div className={cx("popup-section")}>{item.section}</div>
                                {item.items.map((subItem, idx) =>
                                    subItem.path ? (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={cx("section-sub-item-link")}
                                            onClick={() => handleActiveLabel(subItem.label)}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ) : (
                                        <div
                                            key={subItem.label + idx}
                                            className={cx("section-sub-item-link")}
                                            onClick={() => handleActiveLabel(subItem.label)}
                                        >
                                            {subItem.label}
                                        </div>
                                    ),
                                )}
                            </div>
                        }
                    >
                        <div className={cx("section-title")}>{item.icon && <item.icon className={cx("section-title-icon")} />}</div>
                    </Popup>
                ) : (
                    <div className={cx("section-title")} onClick={() => toggleSection(item.section)}>
                        {item.icon && <item.icon className={cx("section-title-icon")} />}
                        <div className={cx("section-title-ic")}>{item.section}</div>
                        <FontAwesomeIcon icon={faCaretDown} className={cx("ft", { rotated: isOpen })} />
                    </div>
                )}
            </div>

            {!collapsed && isOpen && (
                <ul className={cx("section-sub")}>
                    {item.items.map((subItem, idx) => {
                        const isActive =
                            (subItem.path && location.pathname === subItem.path) || (!subItem.path && activeLabel === subItem.label);

                        return (
                            <li
                                key={subItem.path || subItem.label + idx}
                                className={cx("section-sub-item", { active: isActive, "modal-blur": showNotifModal && isActive })}
                            >
                                {subItem.path ? (
                                    <Link
                                        className={cx("section-sub-item-link")}
                                        to={subItem.path}
                                        onClick={() => handleActiveLabel(subItem.label)}
                                    >
                                        {subItem.label}
                                    </Link>
                                ) : (
                                    <div className={cx("section-sub-item-link")} onClick={() => handleActiveLabel(subItem.label)}>
                                        {subItem.label}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default SidebarSection;
