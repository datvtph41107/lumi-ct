"use client";

import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faChevronUp, faChevronDown, faPlus, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Deliverable } from "~/hooks/useContractForm";
import { formatDate } from "~/utils/contract";

const cx = classNames.bind(styles);

interface ContentSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    projectDescription: string;
    setProjectDescription: (value: string) => void;
    contractValue: string;
    handleContractValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    startDate: Date | null;
    endDate: Date | null;
    setShowDatePicker: (show: boolean) => void;
    paymentMethod: string;
    setPaymentMethod: (value: string) => void;
    paymentSchedule: string;
    setPaymentSchedule: (value: string) => void;
    acceptanceConditions: string;
    setAcceptanceConditions: (value: string) => void;
    deliverables: Deliverable[];
    setDeliverables: (deliverables: Deliverable[]) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
    isExpanded,
    onToggle,
    projectDescription,
    setProjectDescription,
    contractValue,
    handleContractValueChange,
    startDate,
    endDate,
    setShowDatePicker,
    paymentMethod,
    setPaymentMethod,
    paymentSchedule,
    setPaymentSchedule,
    acceptanceConditions,
    setAcceptanceConditions,
    deliverables,
    setDeliverables,
}) => {
    const [newDeliverable, setNewDeliverable] = useState("");

    const addDeliverable = () => {
        if (newDeliverable.trim()) {
            const newItem: Deliverable = {
                id: Date.now(),
                text: newDeliverable.trim(),
                completed: false,
            };
            setDeliverables([...deliverables, newItem]);
            setNewDeliverable("");
        }
    };

    const removeDeliverable = (id: number) => {
        setDeliverables(deliverables.filter((item) => item.id !== id));
    };

    const toggleDeliverable = (id: number) => {
        setDeliverables(deliverables.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            addDeliverable();
        }
    };

    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faEdit} /> Nội dung hợp đồng
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Chi tiết phạm vi công việc và điều khoản hợp đồng</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("field")}>
                        <label>Mục đích hợp đồng</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            rows={3}
                            placeholder="Mô tả chi tiết về mục đích và yêu cầu..."
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Giá trị hợp đồng (VNĐ)</label>
                        <input
                            type="text"
                            value={contractValue}
                            onChange={handleContractValueChange}
                            placeholder="0"
                            className={cx("contract-value")}
                        />
                    </div>

                    <div className={cx("field", "date-range")}>
                        <div>
                            <label>Ngày bắt đầu</label>
                            <div className={cx("date-display")} onClick={() => setShowDatePicker(true)}>
                                📅 {formatDate(startDate) || "Chọn ngày"}
                            </div>
                        </div>
                        <div>
                            <label>Ngày kết thúc</label>
                            <div className={cx("date-display")} onClick={() => setShowDatePicker(true)}>
                                📅 {formatDate(endDate) || "Chọn ngày"}
                            </div>
                        </div>
                    </div>

                    <div className={cx("field-row")}>
                        <div className={cx("field")}>
                            <label>Phương thức</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Séc">Séc</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div className={cx("field")}>
                            <label>Lịch thanh toán</label>
                            <select value={paymentSchedule} onChange={(e) => setPaymentSchedule(e.target.value)}>
                                <option value="Thanh toán theo tiến độ">Theo tiến độ</option>
                                <option value="Thanh toán từng đợt">Từng đợt</option>
                                <option value="Thanh toán sau nghiệm thu">Sau nghiệm thu</option>
                                <option value="Thanh toán trước">Trước</option>
                            </select>
                        </div>
                    </div>

                    <div className={cx("field")}>
                        <label>Điều kiện nghiệm thu</label>
                        <textarea
                            value={acceptanceConditions}
                            onChange={(e) => setAcceptanceConditions(e.target.value)}
                            rows={3}
                            placeholder="Mô tả điều kiện nghiệm thu..."
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Sản phẩm bàn giao</label>
                        <div className={cx("deliverable-input")}>
                            <input
                                placeholder="Thêm sản phẩm bàn giao mới..."
                                value={newDeliverable}
                                onChange={(e) => setNewDeliverable(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button className={cx("add-btn")} onClick={addDeliverable}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>

                    {deliverables.length > 0 && (
                        <div className={cx("added-list")}>
                            <p className={cx("label")}>Sản phẩm bàn giao ({deliverables.length})</p>
                            <ul>
                                {deliverables.map((deliverable) => (
                                    <li key={deliverable.id} className={cx({ completed: deliverable.completed })}>
                                        <span className={cx("checkbox")} onClick={() => toggleDeliverable(deliverable.id)}>
                                            {deliverable.completed && <FontAwesomeIcon icon={faCheck} />}
                                        </span>
                                        <span className={cx("text")}>{deliverable.text}</span>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className={cx("trash")}
                                            onClick={() => removeDeliverable(deliverable.id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContentSection;
