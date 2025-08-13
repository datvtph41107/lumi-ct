import { CONTRACT_TYPES } from "~/constants/contract.constant";
import { getContractTypeDescription } from "~/utils/contract";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

const cx = classNames.bind(styles);

interface ContractTypeInfoProps {
    selectedType: string;
}

export const ContractTypeInfo = ({ selectedType }: ContractTypeInfoProps) => {
    const currentType = CONTRACT_TYPES.find((t) => t.value === selectedType);

    return (
        <div className={cx("contract-type-info")}>
            <h4>Loại hợp đồng hiện tại</h4>
            <div className={cx("current-type")}>
                <span className={cx("type-icon")}>{currentType?.icon}</span>
                <div>
                    <strong>{currentType?.label}</strong>
                    <p>{getContractTypeDescription(selectedType)}</p>
                </div>
            </div>
        </div>
    );
};
