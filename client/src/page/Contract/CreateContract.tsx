import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract, faEdit, faCloudUploadAlt, faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateContract.module.scss";
import { useContractDraftStore } from "~/store/contract-draft-store";
import type { ContractCreationMode } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";
import Button from "~/components/Button";
import { routePrivate } from "~/config/routes.config";

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

const CreateContract: React.FC = () => {
    const navigate = useNavigate();
    const { initializeFlow, resetFlow } = useContractDraftStore();
    const [selectedOption, setSelectedOption] = useState<ContractCreationMode | null>(null);

    useEffect(() => {
        resetFlow();
    }, [resetFlow]);

    const handleBack = () => {
        navigate(-1);
    };

    const contractOptions = [
        { id: "basic" as ContractCreationMode, title: "Tạo hợp đồng quản lý cơ bản", description: "Điền thông tin cơ bản của hợp đồng và quản lý theo giai đoạn", icon: faFileContract, features: ["Điền thông tin hợp đồng cơ bản", "Quản lý theo giai đoạn và mốc thời gian", "Theo dõi tiến độ thực hiện", "Quản lý đối tác và công việc"], color: "var(--text-active)" },
        { id: "editor" as ContractCreationMode, title: "Soạn thảo hợp đồng mới", description: "Sử dụng trình soạn thảo để tạo nội dung hợp đồng chi tiết", icon: faEdit, features: ["Trình soạn thảo văn bản chuyên nghiệp", "Template hợp đồng có sẵn", "Định dạng và chỉnh sửa linh hoạt", "Xuất file PDF/Word"], color: "var(--green-block)" },
        { id: "upload" as ContractCreationMode, title: "Tải file lên", description: "Upload file hợp đồng có sẵn và chỉnh sửa nếu cần", icon: faCloudUploadAlt, features: ["Hỗ trợ nhiều định dạng file", "Tự động nhận diện nội dung", "Chuyển đổi sang trình soạn thảo", "Bổ sung thông tin quản lý"], color: "#bf8700" },
    ];

    const handleOptionSelect = (option: ContractCreationMode) => {
        setSelectedOption(option);
        logger.info("Selected contract option:", option);
    };

    const handleContinue = async () => {
        if (selectedOption) {
            await initializeFlow(selectedOption);
            navigate(routePrivate.ContractCollection);
            logger.info("Navigating to contract collection", { mode: selectedOption });
        }
    };

    return (
        <div className={cx("create-contract")}>
            <div className={cx("header")}>
                <button type="button" className={cx("back-button")} onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Quay lại
                </button>
                {selectedOption && (
                    <div className={cx("action-buttons")}>
                        <button type="button" className={cx("btn", "btn-primary")} onClick={handleContinue}>
                            Tiếp tục
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                )}
                <div className={cx("header-content")}>
                    <h1 className={cx("title")}>Tạo hợp đồng mới</h1>
                    <p className={cx("subtitle")}>Chọn phương thức tạo hợp đồng phù hợp với nhu cầu của bạn</p>
                </div>
            </div>

            <div className={cx("content")}>
                <div className={cx("options-grid")}>
                    {contractOptions.map((option) => (
                        <div
                            key={option.id}
                            className={cx("option-card", {
                                selected: selectedOption === option.id,
                            })}
                            onClick={() => handleOptionSelect(option.id)}
                        >
                            <div className={cx("card-header")}>
                                <div className={cx("icon")} style={{ color: option.color }}>
                                    <FontAwesomeIcon icon={option.icon} />
                                </div>
                                <h3 className={cx("option-title")}>{option.title}</h3>
                            </div>

                            <p className={cx("option-description")}>{option.description}</p>

                            <div className={cx("features-list")}>
                                {option.features.map((feature, index) => (
                                    <div key={index} className={cx("feature-item")}>
                                        <span className={cx("feature-bullet")}>•</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedOption === option.id && (
                                <div className={cx("selection-indicator")}>
                                    <div className={cx("selected-badge")}>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                        Đã chọn
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={cx("action-section")}>
                    <Button semiLarge type="button" primary onClick={handleContinue} disabled={!selectedOption} rightIcon={<FontAwesomeIcon icon={faArrowRight} />}>
                        Tiếp tục
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateContract;
