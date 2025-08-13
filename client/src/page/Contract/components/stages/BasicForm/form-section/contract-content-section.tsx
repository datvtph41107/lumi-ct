import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";
import ControlledDateRangeField from "~/components/Form/ControllerValid/ControllerDatePicker";
import ControlledFileUploadField from "~/components/Form/ControllerValid/ControlledFileUploadField";
import { ContractContentRenderer } from "../contract-content/contract-content-renderer";

const cx = classNames.bind(styles);
interface ContractTypeInfoProps {
    selectedType: string;
}

export const ContractContentSection = ({ selectedType }: ContractTypeInfoProps) => {
    return (
        <div className={cx("section-card")}>
            <h3>
                <FontAwesomeIcon icon={faFileContract} />
                3. Nội dung hợp đồng
            </h3>

            <ControlledDateRangeField
                name="dateRange"
                label="Thời gian hiệu lực"
                requiredMessage="Bạn chưa chọn đủ thời gian"
                placeholder="Chọn ngày bắt đầu và kết thúc"
                // onExternalChange={(value) => {
                //     console.log("Date range selected:", value);
                // }}
            />

            <TextArea
                name="description"
                label="Mô tả tổng quan hợp đồng *"
                placeholder="Mô tả tổng quan về mục đích, ý nghĩa và tầm quan trọng của hợp đồng"
                required="Vui lòng mô tả hợp đồng"
                rows={3}
            />

            <ControlledFileUploadField
                name="attachedFiles"
                label="Tài liệu đính kèm (nếu có)"
                maxFiles={5}
                acceptedTypes={[".pdf", ".docx", ".xlsx", ".jpg", ".png"]}
            />

            {/* <ContractContentRenderer contractType={selectedType} /> */}
        </div>
    );
};
