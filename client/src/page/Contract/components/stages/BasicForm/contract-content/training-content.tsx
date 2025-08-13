import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const TrainingContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>🎓 Thông tin đào tạo và chương trình học</h4>
                <p>Quản lý thông tin về đơn vị đào tạo và chương trình đào tạo nhân viên</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="trainingProvider"
                    label="Đơn vị đào tạo *"
                    placeholder="Tên công ty/tổ chức đào tạo"
                    required="Vui lòng nhập đơn vị đào tạo"
                />
                <Input
                    name="trainingProgram"
                    label="Chương trình đào tạo *"
                    placeholder="VD: Khóa học React Advanced, Đào tạo kỹ năng lãnh đạo"
                    required="Vui lòng nhập chương trình"
                />
                <Input name="trainingCost" label="Chi phí đào tạo *" placeholder="VD: 20,000,000 VNĐ" required="Vui lòng nhập chi phí" />
                <Input name="numberOfParticipants" label="Số lượng học viên" placeholder="VD: 15 người, 20-25 người" />
                <Input name="trainingDuration" label="Thời gian đào tạo" placeholder="VD: 40 giờ, 3 tháng" />
                <Input name="trainingFormat" label="Hình thức đào tạo" placeholder="VD: Trực tiếp, Online, Blended" />
            </div>
            <TextArea
                name="trainingContent"
                label="Nội dung đào tạo *"
                placeholder="Mô tả chi tiết về nội dung, mục tiêu và phương pháp đào tạo"
                required="Vui lòng mô tả nội dung đào tạo"
                rows={4}
            />
            <TextArea
                name="certificationInfo"
                label="Thông tin chứng chỉ"
                placeholder="Thông tin về chứng chỉ, bằng cấp hoặc giấy chứng nhận sau khóa học"
                rows={2}
            />
        </div>
    );
};
