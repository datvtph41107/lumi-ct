import type React from "react";
import { useEffect } from "react";
import styles from "./StageDraft.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useContractEditorStore } from "~/store/contract-editor-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";

// Import existing editor components
import HeaderBar from "../DaftContract/HeaderBar/HeaderBar";
import SidebarLeft from "../DaftContract/SidebarLeft/SidebarLeft";
import SidebarRight from "../DaftContract/SidebarRight/SidebarRight";
import EditorPage from "../DaftContract/EditorPage";

// Import new basic form and upload components
import BasicContractForm from "./BasicForm/BasicContractForm";
import FileUploadForm from "./FileUploadForm";
import { routes } from "~/config/routes.config";

const cx = classNames.bind(styles);

interface Stage1DraftProps {
    contractType?: string;
    draftId?: string | null;
}

const StageDraft: React.FC<Stage1DraftProps> = ({ contractType, draftId }) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentContractType = contractType || params.get("mode") || params.get("type") || "basic";
    const currentDraftId = draftId || params.get("draftId");

    // Log draft information for debugging
    useEffect(() => {
        if (currentDraftId) {
            console.log(`Loading draft stage for mode: ${currentContractType}, draftId: ${currentDraftId}`);
        }
    }, [currentContractType, currentDraftId]);
    const { isFullscreen, sidebarCollapsed, toggleSidebar } = useContractEditorStore();

    // Auto collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 1024;
            if (isMobile && !sidebarCollapsed) {
                toggleSidebar();
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarCollapsed, toggleSidebar]);

    // Render different interfaces based on contract type
    const renderStageContent = () => {
        switch (currentContractType) {
            case "editor":
                return (
                    <div className={cx("layout", "print-layout")}>
                        {/* Header */}
                        <div className={cx("layout-head")}>
                            <HeaderBar />
                        </div>

                        {/* Main Content */}
                        <div className={cx("main")}>
                            {/* Left Sidebar */}
                            <div className={cx("sidebar-left")}>
                                <SidebarLeft />
                            </div>

                            {/* Editor Center */}
                            <main className={cx("editor")}>
                                <div className={cx("editor-wrapper")}>
                                    <EditorPage />
                                </div>
                            </main>

                            {/* Right Panel */}
                            <div className={cx("sidebar-right")}>
                                <SidebarRight />
                            </div>
                        </div>
                    </div>
                );

            case "upload":
                return (
                    <div className={cx("simple-layout")}>
                        <FileUploadForm />
                    </div>
                );

            case "basic":
            default:
                return (
                    <div className={cx("simple-layout")}>
                        <BasicContractForm />
                    </div>
                );
        }
    };

    return (
        <div className={cx("stage1-container", { fullscreen: isFullscreen })}>
            {renderStageContent()}

            {/* Toggle sidebar (only for editor mode) */}
            {currentContractType === "editor" && (
                <button className={cx("sidebar-toggle")} onClick={toggleSidebar} title="Toggle Sidebar">
                    <span />
                    <span />
                    <span />
                </button>
            )}
        </div>
    );
};

export default StageDraft;
