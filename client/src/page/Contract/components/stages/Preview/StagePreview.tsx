import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../redux/store";
import { setCurrentStage, saveStage } from "../../../../../redux/slices/contract.slice";
import { ContractStage } from "../../../../../types/contract/contract.types";
import { contractRoutes } from "../../../../../config/routes.config";
import styles from "./StagePreview.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faPrint,
    faDownload,
    faShare,
    faCheckCircle,
    faExclamationTriangle,
    faInfoCircle,
    faArrowLeft,
    faArrowRight,
    faFileContract,
    faUser,
    faCalendar,
    faSignature,
    faEdit,
    faTimes,
    faSearchPlus,
    faSearchMinus,
    faComments,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const StagePreview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { currentContract, formData, selectedMode } = useSelector((state: RootState) => state.contract);

    const [previewMode, setPreviewMode] = useState<"preview" | "print" | "pdf">("preview");
    const [showComments, setShowComments] = useState(false);
    const [showValidation, setShowValidation] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100);

    useEffect(() => {
        if (!currentContract?.id) {
            navigate(contractRoutes.createContract);
            return;
        }
    }, [currentContract, navigate]);

    const handleBackToEdit = () => {
        if (currentContract?.id) {
            navigate(`${contractRoutes.contractDraft.replace(":contractId", currentContract.id)}?stage=${ContractStage.CONTENT_EDITOR}`);
        }
    };

    const handleNextStage = () => {
        if (currentContract?.id) {
            navigate(`${contractRoutes.contractDraft.replace(":contractId", currentContract.id)}?stage=${ContractStage.APPROVAL}`);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export
        console.log("Exporting to PDF...");
    };

    const handleShare = () => {
        // TODO: Implement sharing functionality
        console.log("Sharing contract...");
    };

    const getValidationIssues = () => {
        const issues = [];

        if (!formData?.name) {
            issues.push({ type: "error", message: "Thiếu tên hợp đồng", field: "name" });
        }

        if (!formData?.contractType) {
            issues.push({ type: "warning", message: "Chưa chọn loại hợp đồng", field: "contractType" });
        }

        if (!formData?.dateRange?.startDate) {
            issues.push({ type: "error", message: "Thiếu ngày bắt đầu", field: "startDate" });
        }

        return issues;
    };

    const validationIssues = getValidationIssues();
    const hasErrors = validationIssues.some((issue) => issue.type === "error");
    const hasWarnings = validationIssues.some((issue) => issue.type === "warning");

    return (
        <div className={cx("stage-preview-container")}>
            {/* Header */}
            <div className={cx("preview-header")}>
                <div className={cx("header-left")}>
                    <button className={cx("back-btn")} onClick={handleBackToEdit}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Quay lại chỉnh sửa
                    </button>
                    <div className={cx("contract-info")}>
                        <h2>
                            <FontAwesomeIcon icon={faEye} />
                            Xem trước hợp đồng
                        </h2>
                        <p>{currentContract?.name || "Hợp đồng mới"}</p>
                    </div>
                </div>

                <div className={cx("header-right")}>
                    <div className={cx("preview-controls")}>
                        <button
                            className={cx("control-btn", { active: previewMode === "preview" })}
                            onClick={() => setPreviewMode("preview")}
                        >
                            <FontAwesomeIcon icon={faEye} />
                            Xem trước
                        </button>
                        <button className={cx("control-btn", { active: previewMode === "print" })} onClick={() => setPreviewMode("print")}>
                            <FontAwesomeIcon icon={faPrint} />
                            In
                        </button>
                        <button className={cx("control-btn", { active: previewMode === "pdf" })} onClick={() => setPreviewMode("pdf")}>
                            <FontAwesomeIcon icon={faDownload} />
                            PDF
                        </button>
                    </div>

                    <div className={cx("zoom-controls")}>
                        <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                            <FontAwesomeIcon icon={faSearchMinus} />
                        </button>
                        <span>{zoomLevel}%</span>
                        <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                            <FontAwesomeIcon icon={faSearchPlus} />
                        </button>
                    </div>

                    <div className={cx("action-buttons")}>
                        <button className={cx("action-btn", "share")} onClick={handleShare}>
                            <FontAwesomeIcon icon={faShare} />
                            Chia sẻ
                        </button>
                        <button className={cx("action-btn", "download")} onClick={handleExportPDF}>
                            <FontAwesomeIcon icon={faDownload} />
                            Tải xuống
                        </button>
                        <button className={cx("action-btn", "print")} onClick={handlePrint}>
                            <FontAwesomeIcon icon={faPrint} />
                            In
                        </button>
                    </div>
                </div>
            </div>

            {/* Validation Panel */}
            {showValidation && (
                <div className={cx("validation-panel")}>
                    <div className={cx("validation-header")}>
                        <h3>
                            <FontAwesomeIcon icon={hasErrors ? faExclamationTriangle : faCheckCircle} />
                            Kiểm tra hợp đồng
                        </h3>
                        <button onClick={() => setShowValidation(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className={cx("validation-content")}>
                        {validationIssues.length === 0 ? (
                            <div className={cx("validation-success")}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>Hợp đồng đã sẵn sàng để hoàn thành!</span>
                            </div>
                        ) : (
                            <div className={cx("validation-issues")}>
                                {validationIssues.map((issue, index) => (
                                    <div key={index} className={cx("issue-item", issue.type)}>
                                        <FontAwesomeIcon icon={issue.type === "error" ? faExclamationTriangle : faInfoCircle} />
                                        <span>{issue.message}</span>
                                        <button className={cx("fix-btn")}>
                                            <FontAwesomeIcon icon={faEdit} />
                                            Sửa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Preview Content */}
            <div className={cx("preview-content")} style={{ transform: `scale(${zoomLevel / 100})` }}>
                <div className={cx("contract-preview")}>
                    {/* Contract Header */}
                    <div className={cx("contract-header")}>
                        <div className={cx("contract-title")}>
                            <h1>{formData?.name || "Tên hợp đồng"}</h1>
                            <p className={cx("contract-code")}>Mã hợp đồng: {currentContract?.contract_code || "CH-001"}</p>
                        </div>

                        <div className={cx("contract-meta")}>
                            <div className={cx("meta-item")}>
                                <FontAwesomeIcon icon={faCalendar} />
                                <span>Ngày tạo: {new Date().toLocaleDateString("vi-VN")}</span>
                            </div>
                            <div className={cx("meta-item")}>
                                <FontAwesomeIcon icon={faUser} />
                                <span>Người tạo: {formData?.drafter || "Chưa xác định"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Parties */}
                    <div className={cx("contract-parties")}>
                        <div className={cx("party-section")}>
                            <h3>Bên A (Bên cung cấp dịch vụ)</h3>
                            <div className={cx("party-info")}>
                                <p>
                                    <strong>Tên công ty:</strong> {formData?.parties?.partyA?.name || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {formData?.parties?.partyA?.address || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Điện thoại:</strong> {formData?.parties?.partyA?.phone || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {formData?.parties?.partyA?.email || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Người đại diện:</strong> {formData?.parties?.partyA?.representative || "Chưa nhập"}
                                </p>
                            </div>
                        </div>

                        <div className={cx("party-section")}>
                            <h3>Bên B (Bên sử dụng dịch vụ)</h3>
                            <div className={cx("party-info")}>
                                <p>
                                    <strong>Tên công ty:</strong> {formData?.parties?.partyB?.name || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {formData?.parties?.partyB?.address || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Điện thoại:</strong> {formData?.parties?.partyB?.phone || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {formData?.parties?.partyB?.email || "Chưa nhập"}
                                </p>
                                <p>
                                    <strong>Người đại diện:</strong> {formData?.parties?.partyB?.representative || "Chưa nhập"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contract Content */}
                    <div className={cx("contract-content")}>
                        <h2>Nội dung hợp đồng</h2>

                        <div className={cx("content-section")}>
                            <h3>Điều 1: Đối tượng hợp đồng</h3>
                            <p>{formData?.content?.object || "Nội dung chưa được nhập..."}</p>
                        </div>

                        <div className={cx("content-section")}>
                            <h3>Điều 2: Thời hạn hợp đồng</h3>
                            <p>
                                Hợp đồng có hiệu lực từ ngày{" "}
                                {formData?.dateRange?.startDate
                                    ? new Date(formData.dateRange.startDate).toLocaleDateString("vi-VN")
                                    : "chưa xác định"}
                                đến ngày{" "}
                                {formData?.dateRange?.endDate
                                    ? new Date(formData.dateRange.endDate).toLocaleDateString("vi-VN")
                                    : "chưa xác định"}
                                .
                            </p>
                        </div>

                        <div className={cx("content-section")}>
                            <h3>Điều 3: Giá trị hợp đồng</h3>
                            <p>{formData?.content?.value || "Giá trị chưa được nhập..."}</p>
                        </div>

                        <div className={cx("content-section")}>
                            <h3>Điều 4: Quyền và nghĩa vụ</h3>
                            <div className={cx("obligations")}>
                                <h4>4.1. Quyền và nghĩa vụ của Bên A</h4>
                                <ul>
                                    {formData?.obligations?.partyA?.map((obligation: string, index: number) => (
                                        <li key={index}>{obligation}</li>
                                    )) || <li>Chưa có nội dung</li>}
                                </ul>

                                <h4>4.2. Quyền và nghĩa vụ của Bên B</h4>
                                <ul>
                                    {formData?.obligations?.partyB?.map((obligation: string, index: number) => (
                                        <li key={index}>{obligation}</li>
                                    )) || <li>Chưa có nội dung</li>}
                                </ul>
                            </div>
                        </div>

                        <div className={cx("content-section")}>
                            <h3>Điều 5: Điều khoản chung</h3>
                            <p>{formData?.content?.generalTerms || "Điều khoản chung chưa được nhập..."}</p>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className={cx("signature-section")}>
                        <div className={cx("signature-party")}>
                            <h3>Bên A</h3>
                            <div className={cx("signature-placeholder")}>
                                <FontAwesomeIcon icon={faSignature} />
                                <span>Chữ ký của Bên A</span>
                            </div>
                            <p>Ngày: ___/___/_____</p>
                        </div>

                        <div className={cx("signature-party")}>
                            <h3>Bên B</h3>
                            <div className={cx("signature-placeholder")}>
                                <FontAwesomeIcon icon={faSignature} />
                                <span>Chữ ký của Bên B</span>
                            </div>
                            <p>Ngày: ___/___/_____</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cx("preview-footer")}>
                <div className={cx("footer-left")}>
                    <button className={cx("toggle-btn")} onClick={() => setShowValidation(!showValidation)}>
                        <FontAwesomeIcon icon={showValidation ? faTimes : faCheckCircle} />
                        {showValidation ? "Ẩn" : "Hiện"} kiểm tra
                    </button>
                    <button className={cx("toggle-btn")} onClick={() => setShowComments(!showComments)}>
                        <FontAwesomeIcon icon={faComments} />
                        {showComments ? "Ẩn" : "Hiện"} ghi chú
                    </button>
                </div>

                <div className={cx("footer-right")}>
                    <button className={cx("secondary-btn")} onClick={handleBackToEdit}>
                        <FontAwesomeIcon icon={faEdit} />
                        Chỉnh sửa
                    </button>
                    <button className={cx("primary-btn")} onClick={handleNextStage} disabled={hasErrors}>
                        <FontAwesomeIcon icon={faArrowRight} />
                        Tiếp tục đến phê duyệt
                    </button>
                </div>
            </div>

            {/* Comments Panel */}
            {showComments && (
                <div className={cx("comments-panel")}>
                    <div className={cx("panel-header")}>
                        <h3>
                            <FontAwesomeIcon icon={faComments} />
                            Ghi chú và bình luận
                        </h3>
                        <button onClick={() => setShowComments(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className={cx("panel-content")}>
                        <div className={cx("comment-input")}>
                            <textarea placeholder="Thêm ghi chú hoặc bình luận..." />
                            <button>
                                <FontAwesomeIcon icon={faPaperPlane} />
                                Gửi
                            </button>
                        </div>
                        <div className={cx("comments-list")}>
                            <p>Chưa có ghi chú nào</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StagePreview;
