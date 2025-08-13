"use client";

import type React from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import SidebarDropdown from "../../../Dropdown/Dropdown";
import AutoResizeText from "../AutoResizeText/AutoResizeText";
import { contractTypeOptions, managerOptions, formatDate } from "~/utils/contract";

const cx = classNames.bind(styles);

interface GeneralInfoSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    contractCode: string;
    contractName: string;
    setContractName: (value: string) => void;
    contractType: string;
    setContractType: (value: string) => void;
    currentUser: string;
    manager: string;
    setManager: (value: string) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
    isExpanded,
    onToggle,
    contractCode,
    contractName,
    setContractName,
    contractType,
    setContractType,
    currentUser,
    manager,
    setManager,
}) => {
    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faFile} /> Thông tin chung
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Thông tin cơ bản về hợp đồng</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("field")}>
                        <label>Mã hợp đồng</label>
                        <input type="text" value={contractCode} disabled className={cx("readonly-field")} />
                    </div>

                    <div className={cx("field")}>
                        <label>Tên hợp đồng</label>
                        <AutoResizeText
                            value={contractName}
                            onChange={setContractName}
                            placeholder="Nhập tên hợp đồng..."
                            minRows={2}
                            maxRows={4}
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Loại hợp đồng</label>
                        <SidebarDropdown
                            options={contractTypeOptions}
                            value={contractType}
                            onChange={setContractType}
                            placeholder="Chọn loại hợp đồng"
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Ngày tạo</label>
                        <input type="text" value={formatDate(new Date())} disabled className={cx("readonly-field")} />
                    </div>

                    <div className={cx("field")}>
                        <label>Người soạn thảo</label>
                        <input type="text" value={currentUser} disabled className={cx("readonly-field", "current-user")} />
                    </div>

                    <div className={cx("field")}>
                        <label>Người quản lý hợp đồng</label>
                        <SidebarDropdown options={managerOptions} value={manager} onChange={setManager} placeholder="Chọn người quản lý" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralInfoSection;
