import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import { sidebarItems } from "./sidebarItems";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarHeader from "./SidebarHeader";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarSection from "./SidebarSection";
import SidebarFooter from "./SidebarFooter";
import NotificationModal from "./NotificationModal";

const cx = classNames.bind(styles);

type SidebarProps = {
    collapsed: boolean;
    showChildren: boolean;
    onToggle: () => void;
};

const Sidebar = ({ collapsed, showChildren, onToggle }: SidebarProps) => {
    const location = useLocation();
    const [activeLabel, setActiveLabel] = useState<string | null>(null);
    const [defaultActiveLabel, setDefaultActiveLabel] = useState<string | null>(null);
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [showNotifModal, setShowNotifModal] = useState<boolean>(false);

    useEffect(() => {
        const matchedItem = sidebarItems
            .flatMap((item) => ("items" in item ? item.items : [item]))
            .find((i) => i.path === location.pathname);

        if (matchedItem?.label) {
            setActiveLabel(matchedItem.label);
            setDefaultActiveLabel(matchedItem.label);
            const matchedSection = sidebarItems.find((item) => "items" in item && item.items.some((i) => i.label === matchedItem.label));
            if (matchedSection && "section" in matchedSection) {
                setOpenSections((prev) => (prev.includes(matchedSection.section) ? prev : [...prev, matchedSection.section]));
            }
        }
    }, [location.pathname]);

    const handleActiveLabel = (label: string, hasPath: boolean = true) => {
        if (hasPath) {
            setActiveLabel(label);
            if (showNotifModal) setShowNotifModal(false);
        }
    };

    const toggleSection = (section: string) => {
        setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
    };

    return (
        <div className={cx("sidebar", { collapsed, "show-children": showChildren && !collapsed, animated: true })}>
            <SidebarHeader collapsed={collapsed} onToggle={onToggle} />

            <div className={cx("side-content")}>
                <div className={cx("group-section")}>
                    {sidebarItems.map((item, index) => {
                        if ("label" in item) {
                            return (
                                <SidebarMenuItem
                                    key={index}
                                    item={item}
                                    collapsed={collapsed}
                                    location={location}
                                    activeLabel={activeLabel}
                                    defaultActiveLabel={defaultActiveLabel}
                                    setActiveLabel={setActiveLabel}
                                    setShowNotifModal={setShowNotifModal}
                                    showNotifModal={showNotifModal}
                                />
                            );
                        }

                        if ("section" in item && Array.isArray(item.items)) {
                            return (
                                <SidebarSection
                                    key={index}
                                    item={item}
                                    collapsed={collapsed}
                                    location={location}
                                    openSections={openSections}
                                    toggleSection={toggleSection}
                                    activeLabel={activeLabel}
                                    showNotifModal={showNotifModal}
                                    handleActiveLabel={handleActiveLabel}
                                />
                            );
                        }

                        return null;
                    })}
                </div>
                <SidebarFooter collapsed={collapsed} />
            </div>

            {showNotifModal && (
                <NotificationModal
                    onClose={() => {
                        setShowNotifModal(false);
                        setActiveLabel(defaultActiveLabel);
                    }}
                    collapsed={collapsed}
                />
            )}
        </div>
    );
};

export default Sidebar;
