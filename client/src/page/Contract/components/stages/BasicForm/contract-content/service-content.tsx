import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const ServiceContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>🔧 Thông tin dịch vụ và nhà cung cấp</h4>
                <p>Quản lý chi tiết về dịch vụ được cung cấp và điều khoản hợp đồng</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="serviceProvider"
                    label="Nhà cung cấp dịch vụ *"
                    placeholder="Tên công ty/cá nhân cung cấp dịch vụ"
                    required="Vui lòng nhập nhà cung cấp"
                />
                <Input
                    name="serviceType"
                    label="Loại dịch vụ *"
                    placeholder="VD: Dịch vụ kế toán, Dịch vụ IT"
                    required="Vui lòng nhập loại dịch vụ"
                />
                <Input
                    name="contractValue"
                    label="Giá trị hợp đồng *"
                    placeholder="VD: 50,000,000 VNĐ"
                    required="Vui lòng nhập giá trị hợp đồng"
                />
                <Input
                    name="paymentTerms"
                    label="Điều khoản thanh toán *"
                    placeholder="VD: Thanh toán theo quý, 30 ngày sau khi nhận hóa đơn"
                    required="Vui lòng nhập điều khoản thanh toán"
                />
                <Input name="serviceFrequency" label="Tần suất thực hiện" placeholder="VD: Hàng tháng, Theo yêu cầu" />
                <Input name="qualityStandard" label="Tiêu chuẩn chất lượng" placeholder="VD: ISO 9001, Tiêu chuẩn ngành" />
            </div>
            <TextArea
                name="serviceScope"
                label="Phạm vi dịch vụ *"
                placeholder="Mô tả chi tiết các công việc, dịch vụ và sản phẩm bàn giao"
                required="Vui lòng mô tả phạm vi dịch vụ"
                rows={4}
            />
            <TextArea
                name="deliverables"
                label="Sản phẩm bàn giao"
                placeholder="Danh sách các sản phẩm, tài liệu, báo cáo sẽ được bàn giao"
                rows={3}
            />
        </div>
    );
};
