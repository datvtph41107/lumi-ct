import type { IconType } from "react-icons";
import { BiSolidDashboard } from "react-icons/bi";
import { AiOutlineSetting } from "react-icons/ai";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { RiNotification3Line } from "react-icons/ri";
import { LuMails } from "react-icons/lu";
// Mục đơn
interface MenuItem {
    label: string;
    icon?: IconType;
    path?: string;
}

interface MenuSection {
    section: string;
    icon?: IconType;
    items: MenuItem[];
}

export type SidebarItem = MenuItem | MenuSection;

export const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: BiSolidDashboard },
    { label: "Notifications", icon: RiNotification3Line },
    { label: "Settings", path: "/settings", icon: AiOutlineSetting },
    {
        icon: AiOutlineUsergroupDelete,
        section: "Compliance",
        items: [
            { label: "Frameworks", path: "/compliance/frameworks" },
            { label: "Policies", path: "/compliance/policies" },
            { label: "Evidence", path: "/compliance/evidence" },
            { label: "Risk assessment", path: "/compliance/risk" },
            { label: "Trust center", path: "/compliance/trust" },
        ],
    },
    {
        icon: LuMails,
        section: "Security",
        items: [
            { label: "Attack surface", path: "/security/attack" },
            { label: "Code security", path: "/security/code" },
            { label: "Penetration tests", path: "/security/pen-test" },
        ],
    },
];
