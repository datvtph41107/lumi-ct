import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const RentalContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>🏢 Thông tin bất động sản và điều khoản thuê</h4>
                <p>Quản lý thông tin về bất động sản và các điều khoản thuê mặt bằng</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="landlord"
                    label="Bên cho thuê *"
                    placeholder="Tên chủ sở hữu/công ty cho thuê"
                    required="Vui lòng nhập bên cho thuê"
                />
                <Input
                    name="propertyType"
                    label="Loại bất động sản *"
                    placeholder="VD: Văn phòng, Kho bãi, Nhà xưởng"
                    required="Vui lòng nhập loại bất động sản"
                />
                <Input
                    name="monthlyRent"
                    label="Giá thuê hàng tháng *"
                    placeholder="VD: 50,000,000 VNĐ/tháng"
                    required="Vui lòng nhập giá thuê"
                />
                <Input
                    name="deposit"
                    label="Tiền đặt cọc *"
                    placeholder="VD: 100,000,000 VNĐ (2 tháng tiền thuê)"
                    required="Vui lòng nhập tiền cọc"
                />
                <Input name="area" label="Diện tích" placeholder="VD: 200m², 500m²" />
                <Input name="utilities" label="Chi phí tiện ích" placeholder="VD: Điện, nước, internet, bảo vệ" />
            </div>
            <TextArea
                name="propertyAddress"
                label="Địa chỉ bất động sản *"
                placeholder="Địa chỉ chi tiết của bất động sản cho thuê"
                required="Vui lòng nhập địa chỉ"
                rows={2}
            />
            <TextArea
                name="propertyDescription"
                label="Mô tả bất động sản"
                placeholder="Mô tả chi tiết về tình trạng, tiện ích, vị trí và đặc điểm của bất động s���n"
                rows={3}
            />
            <TextArea
                name="usagePurpose"
                label="Mục đích sử dụng"
                placeholder="Mô tả mục đích sử dụng bất động sản và các hạn chế (nếu có)"
                rows={2}
            />
        </div>
    );
};
