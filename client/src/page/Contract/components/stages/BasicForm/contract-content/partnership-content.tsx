import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const PartnershipContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>🤝 Thông tin hợp tác và đối tác</h4>
                <p>Quản lý thông tin về đối tác và các điều khoản hợp tác kinh doanh</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="partnerCompany"
                    label="Công ty đối tác *"
                    placeholder="Tên công ty đối tác"
                    required="Vui lòng nhập tên đối tác"
                />
                <Input
                    name="partnershipType"
                    label="Loại hợp tác *"
                    placeholder="VD: Phân phối sản phẩm, Hợp tác chiến lược"
                    required="Vui lòng nhập loại hợp tác"
                />
                <Input name="revenueShare" label="Chia sẻ doanh thu" placeholder="VD: 70% - 30%, Theo thỏa thuận" />
                <Input name="territory" label="Khu vực hợp tác" placeholder="VD: Miền Bắc, Toàn quốc" />
                <Input name="exclusivity" label="Tính độc quyền" placeholder="VD: Độc quyền, Không độc quyền" />
                <Input name="minimumCommitment" label="Cam kết tối thiểu" placeholder="VD: 100 triệu VNĐ/năm" />
            </div>
            <TextArea
                name="partnershipScope"
                label="Phạm vi hợp tác *"
                placeholder="Mô tả chi tiết về phạm vi, điều kiện và mục tiêu hợp tác"
                required="Vui lòng mô tả phạm vi hợp tác"
                rows={4}
            />
            <TextArea
                name="responsibilities"
                label="Trách nhiệm các bên"
                placeholder="Phân định rõ trách nhiệm và nghĩa vụ của từng bên"
                rows={3}
            />
        </div>
    );
};
