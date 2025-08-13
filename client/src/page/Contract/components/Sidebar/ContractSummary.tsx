// import { useContractForm } from "~/hooks/useContractForm";
import { CONTRACT_TYPES } from "~/constants/contract.constant";
import classNames from "classnames/bind";
import styles from "./ContractSummary.module.scss";

const cx = classNames.bind(styles);

export const ContractSummary = () => {
    // const { formData } = useContractForm();

    // Get contract type info
    // const currentType = CONTRACT_TYPES.find((t) => t.value === formData.contractType);

    // // Format date for display
    // const formatDate = (dateString: string) => {
    //     if (!dateString) return "Chưa xác định";
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString("vi-VN");
    // };

    // // Format date range
    // const formatDateRange = () => {
    //     if (!formData.dateRange.startDate || !formData.dateRange.endDate) {
    //         return "Chưa xác định";
    //     }
    //     const startDate = new Date(formData.dateRange.startDate).toLocaleDateString("vi-VN");
    //     const endDate = new Date(formData.dateRange.endDate).toLocaleDateString("vi-VN");
    //     return `${startDate} - ${endDate}`;
    // };

    return (
        <div></div>
        // <div className={cx("contract-summary")}>
        //     <h4>Thông tin hợp đồng</h4>

        //     <div className={cx("summary-section")}>
        //         <div className={cx("contract-type-display")}>
        //             <span className={cx("type-icon")}>{currentType?.icon || "📄"}</span>
        //             <div className={cx("type-info")}>
        //                 <strong>{currentType?.label || "Chưa chọn"}</strong>
        //                 <p className={cx("type-description")}>
        //                     {formData.contractType === "employment" &&
        //                         "Quản lý thông tin nhân viên, vị trí công việc, mức lương và các điều khoản lao động"}
        //                     {formData.contractType === "service" &&
        //                         "Hợp đồng cung cấp dịch vụ chuyên nghiệp với các điều khoản và phạm vi công việc cụ thể"}
        //                     {formData.contractType === "partnership" &&
        //                         "Thỏa thuận hợp tác kinh doanh giữa các bên với quyền lợi và nghĩa vụ rõ ràng"}
        //                     {formData.contractType === "rental" && "Hợp đồng thuê mướn tài sản với các điều khoản về thời hạn và giá thuê"}
        //                     {formData.contractType === "consulting" &&
        //                         "Hợp đồng tư vấn chuyên môn với phạm vi công việc và thời gian thực hiện"}
        //                     {formData.contractType === "training" &&
        //                         "Hợp đồng đào tạo với nội dung, thời gian và phương thức đào tạo cụ thể"}
        //                     {formData.contractType === "nda" &&
        //                         "Thỏa thuận bảo mật thông tin với các điều khoản về quyền và nghĩa vụ bảo mật"}
        //                 </p>
        //             </div>
        //         </div>
        //     </div>

        //     <div className={cx("summary-details")}>
        //         <div className={cx("detail-item")}>
        //             <label>Tên hợp đồng:</label>
        //             <span>{formData.title || "Chưa nhập"}</span>
        //         </div>

        //         <div className={cx("detail-item")}>
        //             <label>Ngày tạo:</label>
        //             <span>{formatDate(formData.creationDate)}</span>
        //         </div>

        //         <div className={cx("detail-item")}>
        //             <label>Thời gian hiệu lực:</label>
        //             <span>{formatDateRange()}</span>
        //         </div>

        //         <div className={cx("detail-item")}>
        //             <label>Mô tả:</label>
        //             <span className={cx("description-text")}>{formData.details.description || "Chưa có mô tả"}</span>
        //         </div>

        //         {formData.details.contractValue && (
        //             <div className={cx("detail-item")}>
        //                 <label>Giá trị hợp đồng:</label>
        //                 <span className={cx("contract-value")}>{formData.details.contractValue.toLocaleString("vi-VN")} VNĐ</span>
        //             </div>
        //         )}

        //         {formData.details.vendorName && (
        //             <div className={cx("detail-item")}>
        //                 <label>Đối tác:</label>
        //                 <span>{formData.details.vendorName}</span>
        //             </div>
        //         )}

        //         {formData.details.department && (
        //             <div className={cx("detail-item")}>
        //                 <label>Phòng ban:</label>
        //                 <span>{formData.details.department}</span>
        //             </div>
        //         )}
        //     </div>

        //     <div className={cx("summary-stats")}>
        //         <div className={cx("stat-item")}>
        //             <span className={cx("stat-number")}>{formData.milestones.length}</span>
        //             <span className={cx("stat-label")}>Mốc thời gian</span>
        //         </div>
        //         <div className={cx("stat-item")}>
        //             <span className={cx("stat-number")}>
        //                 {formData.milestones.reduce((total, milestone) => total + milestone.tasks.length, 0)}
        //             </span>
        //             <span className={cx("stat-label")}>Công việc</span>
        //         </div>
        //     </div>
        // </div>
    );
};
