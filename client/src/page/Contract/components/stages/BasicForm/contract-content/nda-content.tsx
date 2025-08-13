import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import classNames from "classnames/bind";
import styles from "../BasicContractForm.module.scss";

const cx = classNames.bind(styles);

export const NdaContent = () => {
    return (
        <div className={cx("contract-content")}>
            <div className={cx("content-header")}>
                <h4>🔒 Thông tin bảo mật và các bên liên quan</h4>
                <p>Quản lý thông tin về các bên và phạm vi thông tin cần bảo mật</p>
            </div>
            <div className={cx("form-grid")}>
                <Input
                    name="disclosingParty"
                    label="Bên tiết lộ thông tin *"
                    placeholder="Tên công ty/cá nhân tiết lộ thông tin"
                    required="Vui lòng nhập bên tiết lộ"
                />
                <Input
                    name="receivingParty"
                    label="Bên nhận thông tin *"
                    placeholder="Tên công ty/cá nhân nhận thông tin"
                    required="Vui lòng nhập bên nhận"
                />
                <Input
                    name="confidentialityPeriod"
                    label="Thời hạn bảo mật *"
                    placeholder="VD: 5 năm, 10 năm, Vô thời hạn"
                    required="Vui lòng nhập thời hạn"
                />
                <Input name="purposeOfDisclosure" label="Mục đích tiết lộ" placeholder="VD: Đàm phán hợp tác, Đánh giá dự án" />
                <Input name="penaltyAmount" label="Mức phạt vi phạm" placeholder="VD: 1,000,000,000 VNĐ" />
                <Input name="jurisdiction" label="Thẩm quyền giải quyết" placeholder="VD: Tòa án TP.HCM" />
            </div>
            <TextArea
                name="ndaScope"
                label="Phạm vi thông tin bảo mật *"
                placeholder="Mô tả chi tiết các loại thông tin, tài liệu, dữ liệu cần được bảo mật"
                required="Vui lòng mô tả phạm vi bảo mật"
                rows={4}
            />
            <TextArea
                name="exceptions"
                label="Ngoại lệ bảo mật"
                placeholder="Các trường hợp thông tin không cần bảo mật (thông tin công khai, đã biết trước...)"
                rows={3}
            />
        </div>
    );
};
