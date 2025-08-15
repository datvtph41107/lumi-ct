import type { DateRange, TimeRange } from "~/types/contract/contract.types";

export const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

export const contractTypeOptions = [
    { value: "Kinh tế", label: "Hợp đồng Kinh tế", icon: "💼" },
    { value: "Lao động", label: "Hợp đồng Lao động", icon: "👥" },
    { value: "Dịch vụ", label: "Hợp đồng Dịch vụ", icon: "🔧" },
    { value: "Nguyên tắc", label: "Hợp đồng Nguyên tắc", icon: "📋" },
    { value: "Mua bán", label: "Hợp đồng Mua bán", icon: "🛒" },
    { value: "Thuê", label: "Hợp đồng Thuê", icon: "🏠" },
];

export const managerOptions = [
    { value: "Trần Thị B - Phòng Kinh doanh", label: "Trần Thị B", icon: "👤" },
    { value: "Lê Văn C - Phòng Pháp chế", label: "Lê Văn C", icon: "👤" },
    { value: "Phạm Thị D - Phòng Tài chính", label: "Phạm Thị D", icon: "👤" },
    { value: "Hoàng Văn E - Phòng Kinh doanh", label: "Hoàng Văn E", icon: "👤" },
];

export const convertDateRange = (dateRange: DateRange): DateRange => {
    return {
        startDate: dateRange.startDate ? new Date(dateRange.startDate).toISOString() : null,
        endDate: dateRange.endDate ? new Date(dateRange.endDate).toISOString() : null,
    };
};

export const convertTimeRange = (timeRange: TimeRange): TimeRange => {
    return {
        startDate: timeRange.startDate ? new Date(timeRange.startDate).toISOString() : null,
        endDate: timeRange.endDate ? new Date(timeRange.endDate).toISOString() : null,
        estimatedHours: timeRange.estimatedHours || 0,
    };
};

// Convert từ Date objects sang ISO strings
export const dateToISOString = (date: Date | null): string | null => {
    return date ? date.toISOString() : null;
};

// Convert từ ISO strings sang Date objects
export const isoStringToDate = (isoString: string | null): Date | null => {
    return isoString ? new Date(isoString) : null;
};

// Tính toán estimated hours từ start và end date
export const calculateEstimatedHours = (startDate: Date | null, endDate: Date | null): number => {
    if (!startDate || !endDate) return 0;
    return Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
};

// Format date cho hiển thị
export const formatDateForDisplay = (isoString: string | null): string => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("vi-VN");
};

// Validate date range
export const validateDateRange = (dateRange: DateRange): string | null => {
    console.log(123);

    if (!dateRange.startDate || !dateRange.endDate) {
        return "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc";
    }

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    if (start >= end) {
        return "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    return null;
};

// Validate time range
export const validateTimeRange = (timeRange: TimeRange): string | null => {
    if (!timeRange.startDate || !timeRange.endDate) {
        return "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc";
    }

    const start = new Date(timeRange.startDate);
    const end = new Date(timeRange.endDate);

    if (start >= end) {
        return "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    if (timeRange.estimatedHours <= 0) {
        return "Thời gian ước tính phải lớn hơn 0";
    }

    return null;
};

// export const generateContractCode = (): string => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const day = String(now.getDate()).padStart(2, "0");
//     const random = Math.floor(Math.random() * 1000)
//         .toString()
//         .padStart(3, "0");
//     return `HD${year}${month}${day}${random}`;
// };

export const formatVietnameseDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN");
};

export const getContractTypeDescription = (contractType: string): string => {
    const descriptions = {
        employment: "Quản lý thông tin nhân viên, vị trí công việc, mức lương và các điều khoản lao động",
        service: "Quản lý nhà cung cấp dịch vụ, phạm vi công việc, giá trị hợp đồng và điều khoản thanh toán",
        partnership: "Quản lý thông tin đối tác, loại hợp tác, phạm vi hoạt động và chia sẻ lợi ích",
        rental: "Quản lý thông tin bất động sản, giá thuê, tiền cọc và các điều khoản thuê",
        consulting: "Quản lý chuyên gia tư vấn, lĩnh vực chuyên môn, phí tư vấn và thời gian thực hiện",
        training: "Quản lý đơn vị đào tạo, chương trình học, chi phí và số lượng học viên",
        nda: "Quản lý thông tin bảo mật, các bên liên quan, thời hạn và phạm vi bảo mật",
    };
    return descriptions[contractType as keyof typeof descriptions] || "";
};

const contractTypePrefixMap: Record<string, string> = {
    employment: "EM",
    service: "SV",
    partnership: "PT",
    rental: "RT",
    consulting: "CS",
    training: "TR",
    nda: "NDA",
};

let serialCounter = 0;

export const generateContractCode = (contractType: string, date = new Date(), serial?: number): string => {
    const prefix = contractTypePrefixMap[contractType] || "CT";
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const serialNumber = (serial ?? ++serialCounter).toString().padStart(3, "0");

    return `${prefix}-${yyyymmdd}-${serialNumber}`;
};
