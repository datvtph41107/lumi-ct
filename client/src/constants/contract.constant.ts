import type { Option } from "~/types/contract/contract.types";

export const CONTRACT_TYPES: Option[] = [
    {
        value: "employment",
        label: "Hợp đồng lao động",
        icon: "👤",
    },
    {
        value: "service",
        label: "Hợp đồng dịch vụ",
        icon: "🔧",
    },
    {
        value: "partnership",
        label: "Hợp đồng hợp tác",
        icon: "🤝",
    },
    {
        value: "rental",
        label: "Hợp đồng thuê mặt bằng",
        icon: "🏢",
    },
    {
        value: "consulting",
        label: "Hợp đồng tư vấn",
        icon: "💼",
    },
    {
        value: "training",
        label: "Hợp đồng đào tạo",
        icon: "🎓",
    },
    {
        value: "nda",
        label: "Thỏa thuận bảo mật (NDA)",
        icon: "🔒",
    },
];

export const EMPLOYEES: Option[] = [
    { value: "nguyen_van_a", label: "Nguyễn Văn A - Phòng Kế toán", icon: "👨‍💼" },
    { value: "tran_thi_b", label: "Trần Thị B - Phòng Nhân sự", icon: "👩‍💼" },
    { value: "le_van_c", label: "Lê Văn C - Phòng Kinh doanh", icon: "👨‍💼" },
    { value: "pham_thi_d", label: "Phạm Thị D - Phòng Pháp chế", icon: "👩‍💼" },
    { value: "hoang_van_e", label: "Hoàng Văn E - Phòng IT", icon: "👨‍💻" },
];

export const CONTRACT_TYPE_DESCRIPTIONS = {
    employment: "Quản lý thông tin nhân viên, vị trí công việc, mức lương và các điều khoản lao động",
    service: "Quản lý nhà cung cấp dịch vụ, phạm vi công việc, giá trị hợp đồng và điều khoản thanh toán",
    partnership: "Quản lý thông tin đối tác, loại hợp tác, phạm vi hoạt động và chia sẻ lợi ích",
    rental: "Quản lý thông tin bất động sản, giá thuê, tiền cọc và các điều khoản thuê",
    consulting: "Quản lý chuyên gia tư vấn, lĩnh vực chuyên môn, phí tư vấn và thời gian thực hiện",
    training: "Quản lý đơn vị đào tạo, chương trình học, chi phí và số lượng học viên",
    nda: "Quản lý thông tin bảo mật, các bên liên quan, thời hạn và phạm vi bảo mật",
} as const;
