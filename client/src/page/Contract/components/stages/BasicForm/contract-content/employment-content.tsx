import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const EmploymentContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>📋 Thông tin nhân viên và công việc</h4>
                <p>Quản lý thông tin chi tiết về nhân viên và điều kiện làm việc</p>
            </div>
            <div className={cx("form-grid")}>
                <Input name="employeeName" label="Tên nhân viên *" placeholder="Họ và tên đầy đủ" required="Vui lòng nhập tên nhân viên" />
                <Input
                    name="position"
                    label="Vị trí công việc *"
                    placeholder="VD: Lập trình viên Frontend"
                    required="Vui lòng nhập vị trí công việc"
                />
                <Input
                    name="department"
                    label="Phòng ban *"
                    placeholder="VD: Phòng Công nghệ thông tin"
                    required="Vui lòng nhập phòng ban"
                />
                <Input name="salary" label="Mức lương *" placeholder="VD: 15,000,000 VNĐ/tháng" required="Vui lòng nhập mức lương" />
                <Input name="probationPeriod" label="Thời gian thử việc" placeholder="VD: 2 tháng" />
                <Input name="workLocation" label="Địa điểm làm việc" placeholder="VD: Tầng 5, Tòa nhà ABC" />
            </div>
            <TextArea
                name="jobDescription"
                label="Mô tả công việc *"
                placeholder="Mô tả chi tiết về công việc, trách nhiệm và yêu cầu"
                required="Vui lòng mô tả công việc"
                rows={4}
            />
            <TextArea
                name="benefits"
                label="Quyền lợi và phúc lợi"
                placeholder="Mô tả các quyền lợi, phúc lợi và chế độ đãi ngộ"
                rows={3}
            />
        </div>
    );
};
