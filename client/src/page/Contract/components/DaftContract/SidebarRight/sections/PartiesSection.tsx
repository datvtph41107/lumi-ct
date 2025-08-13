"use client";

import type React from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { ContractParty } from "~/hooks/useContractForm";

const cx = classNames.bind(styles);

interface PartiesSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    partyA: ContractParty;
    setPartyA: (party: ContractParty) => void;
    partyB: ContractParty;
    setPartyB: (party: ContractParty) => void;
}

const PartyForm: React.FC<{
    party: ContractParty;
    setParty: (party: ContractParty) => void;
    title: string;
    isCompany?: boolean;
}> = ({ party, setParty, title, isCompany = true }) => (
    <div className={cx("party-section")}>
        <h5>{title}</h5>
        <div className={cx("field")}>
            <label>{isCompany ? "Tên đơn vị" : "Tên đơn vị/cá nhân"}</label>
            <input
                type="text"
                value={party.name}
                onChange={(e) => setParty({ ...party, name: e.target.value })}
                placeholder={isCompany ? "" : "Nhập tên đơn vị hoặc cá nhân"}
            />
        </div>
        <div className={cx("field-row")}>
            <div className={cx("field")}>
                <label>Mã số thuế</label>
                <input
                    type="text"
                    value={party.taxCode}
                    onChange={(e) => setParty({ ...party, taxCode: e.target.value })}
                    placeholder={isCompany ? "" : "Nếu có"}
                />
            </div>
            <div className={cx("field")}>
                <label>Chức vụ</label>
                <input type="text" value={party.position} onChange={(e) => setParty({ ...party, position: e.target.value })} />
            </div>
        </div>
        <div className={cx("field")}>
            <label>Đại diện ký tên</label>
            <input type="text" value={party.representative} onChange={(e) => setParty({ ...party, representative: e.target.value })} />
        </div>
        <div className={cx("field")}>
            <label>Địa chỉ</label>
            <textarea value={party.address} onChange={(e) => setParty({ ...party, address: e.target.value })} rows={2} />
        </div>
        <div className={cx("field-row")}>
            <div className={cx("field")}>
                <label>Số điện thoại</label>
                <input type="text" value={party.phone} onChange={(e) => setParty({ ...party, phone: e.target.value })} />
            </div>
            <div className={cx("field")}>
                <label>Email</label>
                <input type="email" value={party.email} onChange={(e) => setParty({ ...party, email: e.target.value })} />
            </div>
        </div>
    </div>
);

const PartiesSection: React.FC<PartiesSectionProps> = ({ isExpanded, onToggle, partyA, setPartyA, partyB, setPartyB }) => {
    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faBuilding} /> Thông tin các bên
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Thông tin bên A và bên B</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <PartyForm party={partyA} setParty={setPartyA} title="Bên A (Doanh nghiệp)" isCompany={true} />
                    <PartyForm party={partyB} setParty={setPartyB} title="Bên B (Khách hàng/Đối tác)" isCompany={false} />
                </div>
            )}
        </div>
    );
};

export default PartiesSection;
