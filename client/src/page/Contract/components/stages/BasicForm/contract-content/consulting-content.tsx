import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const ConsultingContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>💼 Thông tin tư vấn và chuyên gia</h4>
                <p>Quản lý thông tin về chuyên gia tư vấn và phạm vi công việc tư vấn</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="consultantName"
                    label="Tên chuyên gia tư vấn *"
                    placeholder="Họ tên chuyên gia hoặc công ty tư vấn"
                    required="Vui lòng nhập tên chuyên gia"
                />
                <Input
                    name="consultingArea"
                    label="Lĩnh vực tư vấn *"
                    placeholder="VD: Tư vấn chiến lược, Tư vấn tài chính"
                    required="Vui lòng nhập lĩnh vực tư vấn"
                />
                <Input
                    name="consultingFee"
                    label="Phí tư vấn *"
                    placeholder="VD: 500,000 VNĐ/giờ, 50,000,000 VNĐ/dự án"
                    required="Vui lòng nhập phí tư vấn"
                />
                <Input name="projectDuration" label="Thời gian dự kiến" placeholder="VD: 3 tháng, 6 tháng" />
                <Input name="expertise" label="Chuyên môn" placeholder="VD: MBA, CPA, 10 năm kinh nghiệm" />
                <Input name="deliveryMethod" label="Hình thức tư vấn" placeholder="VD: Trực tiếp, Online, Kết hợp" />
            </div>
            <TextArea
                name="consultingScope"
                label="Phạm vi tư vấn *"
                placeholder="Mô tả chi tiết về nội dung, mục tiêu và phạm vi công việc tư vấn"
                required="Vui lòng mô tả phạm vi tư vấn"
                rows={4}
            />
            <TextArea
                name="expectedOutcome"
                label="Kết quả mong đợi"
                placeholder="Mô tả các kết quả, báo cáo, khuyến nghị mong đợi từ dự án tư vấn"
                rows={3}
            />
        </div>
    );
};
