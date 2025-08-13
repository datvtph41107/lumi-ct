"use client";

import type React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import BaseModal from "./BaseModal";
import NotificationsSection from "../sections/NotificationSection";
import type { Notification } from "~/types/milestones";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    markNotificationAsRead: (id: number) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, ...props }) => {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Thông báo" icon={<FontAwesomeIcon icon={faBell} />} size="large">
            <NotificationsSection isExpanded={true} onToggle={() => {}} {...props} />
        </BaseModal>
    );
};

export default NotificationsModal;
