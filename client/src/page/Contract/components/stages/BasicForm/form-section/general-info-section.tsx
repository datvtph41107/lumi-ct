import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import Input from "~/components/Input";
import { CONTRACT_TYPES, EMPLOYEES } from "~/constants/contract.constant";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";
import ControlledDropdownField from "~/components/Form/ControllerValid/ControllerDropdown";

const cx = classNames.bind(styles);

export const GeneralInfoSection = () => {
    return (
        <div className={cx("section-card")}>
            <h3>
                <FontAwesomeIcon icon={faFileContract} />
                2. Thông tin chung
            </h3>
            <div className={cx("form-grid")}>
                <Input
                    name="name"
                    label="Tên hợp đồng *"
                    placeholder="VD: Hợp đồng cung cấp dịch vụ kế toán quý 3/2025"
                    required="Vui lòng nhập tên hợp đồng"
                />

                <ControlledDropdownField
                    name="contractType"
                    label="Loại hợp đồng *"
                    options={CONTRACT_TYPES}
                    requiredMessage="Vui lòng chọn loại hợp đồng"
                    placeholder="Chọn loại hợp đồng"
                />

                <Input name="creationDate" label="Ngày tạo" placeholder="Ngày tạo tự động" disabled />

                <Input name="drafter" label="Người soạn thảo" placeholder="Người dùng hiện tại" disabled />

                <ControlledDropdownField
                    name="manager"
                    label="Người quản lý hợp đồng"
                    options={EMPLOYEES}
                    placeholder="Chọn người quản lý"
                />
            </div>
        </div>
    );
};
