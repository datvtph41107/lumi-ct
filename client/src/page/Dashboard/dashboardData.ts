import {
    faWindowRestore,
    faPenToSquare,
    faCircleCheck,
    faFileInvoiceDollar,
    faCalendarCheck,
    faTasks,
    faAddressBook,
    faClockRotateLeft,
    faUserGroup,
    faUsersGear,
} from "@fortawesome/free-solid-svg-icons";

export const dashboardData = [
    {
        title: "26 hợp đồng đang theo dõi",
        icon: faWindowRestore,
        statuses: [
            { label: "Đang thực hiện", value: 12, icon: faPenToSquare, className: "in-progress", highlight: true },
            { label: "Đã nghiệm thu", value: 8, icon: faCircleCheck, className: "done", color: "#29A37E" },
            { label: "Chờ thanh toán", value: 6, icon: faFileInvoiceDollar, className: "pending-payment" },
        ],
    },
    {
        title: "134 công việc được giao",
        icon: faCalendarCheck,
        statuses: [
            { label: "Chưa bắt đầu", value: 10, icon: faClockRotateLeft, className: "not-started" },
            { label: "Đang xử lý", value: 97, icon: faTasks, className: "processing", highlight: true },
            { label: "Đã hoàn thành", value: 27, icon: faCircleCheck, className: "completed", color: "#29A37E" },
        ],
    },
    {
        title: "Theo dõi / quản lý",
        icon: faAddressBook,
        statuses: [
            { label: "Hoạt động mới", value: 4, icon: faClockRotateLeft, className: "self" },
            { label: "Nhân sự trong phòng", value: 5, icon: faUserGroup, className: "staff" },
            { label: "Công việc đang giám sát", value: 12, icon: faUsersGear, className: "contract-task" },
        ],
    },
];
