import React from "react";
import { useNavigate } from "react-router-dom";
import { useContractStore } from "~/store/contract-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUser, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./Stage.module.scss";
import { routes } from "~/config/routes.config";

const cx = classNames.bind(styles);

interface ContractData {
    partyA: {
        name: string;
        taxCode: string;
        position: string;
        representative: string;
        address: string;
        phone: string;
        email: string;
    };
    partyB: {
        name: string;
        taxCode: string;
        position: string;
        representative: string;
        address: string;
        phone: string;
        email: string;
    };
}

const StageParties: React.FC = () => {
    const navigate = useNavigate();
    const { contractData, updateContractData, validateStage, markStageComplete } = useContractStore();

    const handleNext = () => {
        if (validateStage(2)) {
            markStageComplete(2);
            navigate(`/${routes.createContract}?stage=3`);
        } else {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        }
    };

    const handlePrevious = () => {
        navigate(`/${routes.createContract}?stage=1`);
    };

    // Hàm cập nhật thông tin các bên
    const updatePartyA = (field: keyof ContractData["partyA"], value: string) => {
        updateContractData({
            partyA: { ...contractData.partyA, [field]: value },
        });
    };

    const updatePartyB = (field: keyof ContractData["partyB"], value: string) => {
        updateContractData({
            partyB: { ...contractData.partyB, [field]: value },
        });
    };

    return (
        <div className={cx("stage-container")}>
            <div className={cx("stage-header")}>
                <h1>Giai đoạn 2: Thông tin các bên</h1>
                <p>Nhập thông tin chi tiết về bên A và bên B trong hợp đồng</p>
            </div>

            <div className={cx("stage-content", "parties-layout")}>
                {/* Bên A */}
                <div className={cx("party-section")}>
                    <div className={cx("section-header")}>
                        <FontAwesomeIcon icon={faBuilding} />
                        <h2>Bên A (Doanh nghiệp)</h2>
                    </div>

                    <div className={cx("form-grid")}>
                        <div className={cx("form-group", "full-width")}>
                            <label>Tên đơn vị *</label>
                            <input
                                type="text"
                                value={contractData.partyA.name}
                                onChange={(e) => updatePartyA("name", e.target.value)}
                                placeholder="Tên công ty/doanh nghiệp"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Mã số thuế</label>
                            <input
                                type="text"
                                value={contractData.partyA.taxCode}
                                onChange={(e) => updatePartyA("taxCode", e.target.value)}
                                placeholder="Mã số thuế"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Chức vụ</label>
                            <input
                                type="text"
                                value={contractData.partyA.position}
                                onChange={(e) => updatePartyA("position", e.target.value)}
                                placeholder="Chức vụ"
                            />
                        </div>

                        <div className={cx("form-group", "full-width")}>
                            <label>Đại diện ký tên *</label>
                            <input
                                type="text"
                                value={contractData.partyA.representative}
                                onChange={(e) => updatePartyA("representative", e.target.value)}
                                placeholder="Họ tên người đại diện"
                            />
                        </div>

                        <div className={cx("form-group", "full-width")}>
                            <label>Địa chỉ</label>
                            <textarea
                                value={contractData.partyA.address}
                                onChange={(e) => updatePartyA("address", e.target.value)}
                                rows={2}
                                placeholder="Địa chỉ trụ sở"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                value={contractData.partyA.phone}
                                onChange={(e) => updatePartyA("phone", e.target.value)}
                                placeholder="Số điện thoại"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={contractData.partyA.email}
                                onChange={(e) => updatePartyA("email", e.target.value)}
                                placeholder="Email liên hệ"
                            />
                        </div>
                    </div>
                </div>

                {/* Bên B */}
                <div className={cx("party-section")}>
                    <div className={cx("section-header")}>
                        <FontAwesomeIcon icon={faUser} />
                        <h2>Bên B (Khách hàng/Đối tác)</h2>
                    </div>

                    <div className={cx("form-grid")}>
                        <div className={cx("form-group", "full-width")}>
                            <label>Tên đơn vị/cá nhân *</label>
                            <input
                                type="text"
                                value={contractData.partyB.name}
                                onChange={(e) => updatePartyB("name", e.target.value)}
                                placeholder="Tên công ty hoặc cá nhân"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Mã số thuế</label>
                            <input
                                type="text"
                                value={contractData.partyB.taxCode}
                                onChange={(e) => updatePartyB("taxCode", e.target.value)}
                                placeholder="Mã số thuế (nếu có)"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Chức vụ</label>
                            <input
                                type="text"
                                value={contractData.partyB.position}
                                onChange={(e) => updatePartyB("position", e.target.value)}
                                placeholder="Chức vụ"
                            />
                        </div>

                        <div className={cx("form-group", "full-width")}>
                            <label>Đại diện ký tên *</label>
                            <input
                                type="text"
                                value={contractData.partyB.representative}
                                onChange={(e) => updatePartyB("representative", e.target.value)}
                                placeholder="Họ tên người đại diện"
                            />
                        </div>

                        <div className={cx("form-group", "full-width")}>
                            <label>Địa chỉ</label>
                            <textarea
                                value={contractData.partyB.address}
                                onChange={(e) => updatePartyB("address", e.target.value)}
                                rows={2}
                                placeholder="Địa chỉ"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                value={contractData.partyB.phone}
                                onChange={(e) => updatePartyB("phone", e.target.value)}
                                placeholder="Số điện thoại"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={contractData.partyB.email}
                                onChange={(e) => updatePartyB("email", e.target.value)}
                                placeholder="Email liên hệ"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx("stage-actions")}>
                <button onClick={handlePrevious} className={cx("prev-btn")}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại</span>
                </button>

                <button onClick={handleNext} className={cx("next-btn", { disabled: !validateStage(2) })} disabled={!validateStage(2)}>
                    <span>Tiếp tục</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>
        </div>
    );
};

export default StageParties;
