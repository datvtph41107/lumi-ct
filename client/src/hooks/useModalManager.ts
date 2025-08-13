"use client";

import { useState } from "react";

// Chỉ giữ lại 2 modal types cần thiết
export type ModalType = "milestones-tasks" | "notifications";

export const useModalManager = () => {
    const [openModals, setOpenModals] = useState<Set<ModalType>>(new Set());

    const openModal = (modalType: ModalType) => {
        setOpenModals((prev) => new Set(prev).add(modalType));
    };

    const closeModal = (modalType: ModalType) => {
        setOpenModals((prev) => {
            const newSet = new Set(prev);
            newSet.delete(modalType);
            return newSet;
        });
    };

    const closeAllModals = () => {
        setOpenModals(new Set());
    };

    const isModalOpen = (modalType: ModalType) => {
        return openModals.has(modalType);
    };

    const toggleModal = (modalType: ModalType) => {
        if (isModalOpen(modalType)) {
            closeModal(modalType);
        } else {
            openModal(modalType);
        }
    };

    return {
        openModal,
        closeModal,
        closeAllModals,
        isModalOpen,
        toggleModal,
        openModalsCount: openModals.size,
    };
};
