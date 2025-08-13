"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: "completed" | "in-progress" | "pending" | "overdue";
    priority: "high" | "medium" | "low";
}

interface Milestone {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: "completed" | "in-progress" | "pending" | "overdue";
    progress: number;
    tasks: Task[];
    paymentAmount?: string;
}

interface Partner {
    id: string;
    name: string;
    role: string;
    contact: string;
    email: string;
}

interface Attachment {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url: string;
}

interface Contract {
    id: string;
    title: string;
    client: string;
    startDate: string;
    endDate: string;
    status: "active" | "completed" | "pending" | "expired" | "draft";
    progress: number;
    value: string;
    type: string;
    description: string;
    createdDate: Date;
    owner: string;
    category: string;
    milestones: Milestone[];
    partners: Partner[];
    attachments: Attachment[];
    activities: Activity[];
}

interface Activity {
    id: string;
    type: "comment" | "status_change" | "milestone_completed" | "file_uploaded";
    user: string;
    content: string;
    timestamp: Date;
}

interface ContractContextType {
    contracts: Contract[];
    loading: boolean;
    error: string | null;
    getContractById: (id: string) => Contract | undefined;
    updateContract: (id: string, updates: Partial<Contract>) => void;
    addComment: (contractId: string, comment: string) => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error("useContract must be used within a ContractProvider");
    }
    return context;
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Generate sample data for different contract types
    const generateSampleData = (): Contract[] => {
        return [
            // Software Development Contract
            {
                id: "HD001",
                title: "Hợp đồng phát triển phần mềm quản lý",
                client: "Công ty ABC Technology",
                startDate: "01/08/2025",
                endDate: "01/02/2026",
                status: "active",
                progress: 65,
                value: "1,200,000,000 VNĐ",
                type: "software",
                description: "Phát triển hệ thống quản lý tài nguyên doanh nghiệp (ERP) cho công ty ABC Technology",
                createdDate: new Date(2025, 7, 1),
                owner: "Nguyễn Văn A",
                category: "Phần mềm",
                milestones: [
                    {
                        id: "m1",
                        title: "Phân tích và thiết kế hệ thống",
                        description: "Thu thập yêu cầu, phân tích nghiệp vụ và thiết kế kiến trúc hệ thống",
                        startDate: "01/08/2025",
                        endDate: "31/08/2025",
                        status: "completed",
                        progress: 100,
                        paymentAmount: "240,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t1",
                                title: "Thu thập yêu cầu từ khách hàng",
                                description: "Phỏng vấn stakeholder và thu thập requirements",
                                assignee: "Trần Thị B",
                                dueDate: "15/08/2025",
                                status: "completed",
                                priority: "high",
                            },
                            {
                                id: "t2",
                                title: "Thiết kế database",
                                description: "Thiết kế cơ sở dữ liệu và mối quan hệ",
                                assignee: "Lê Văn C",
                                dueDate: "25/08/2025",
                                status: "completed",
                                priority: "high",
                            },
                        ],
                    },
                    {
                        id: "m2",
                        title: "Phát triển module cốt lõi",
                        description: "Phát triển các module chính của hệ thống ERP",
                        startDate: "01/09/2025",
                        endDate: "31/10/2025",
                        status: "in-progress",
                        progress: 70,
                        paymentAmount: "480,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t3",
                                title: "Module quản lý nhân sự",
                                description: "Phát triển tính năng quản lý nhân viên",
                                assignee: "Phạm Văn D",
                                dueDate: "30/09/2025",
                                status: "completed",
                                priority: "high",
                            },
                            {
                                id: "t4",
                                title: "Module quản lý tài chính",
                                description: "Phát triển tính năng kế toán và tài chính",
                                assignee: "Hoàng Thị E",
                                dueDate: "15/10/2025",
                                status: "in-progress",
                                priority: "high",
                            },
                        ],
                    },
                ],
                partners: [
                    {
                        id: "p1",
                        name: "Nguyễn Minh H",
                        role: "Project Manager - ABC Technology",
                        contact: "0123456789",
                        email: "minh.h@abc-tech.com",
                    },
                    {
                        id: "p2",
                        name: "Trần Văn I",
                        role: "Technical Lead - ABC Technology",
                        contact: "0987654321",
                        email: "van.i@abc-tech.com",
                    },
                ],
                attachments: [
                    {
                        id: "a1",
                        name: "Hợp đồng phát triển phần mềm.pdf",
                        type: "PDF",
                        size: "2.5 MB",
                        uploadDate: "01/08/2025",
                        url: "#",
                    },
                    {
                        id: "a2",
                        name: "Tài liệu yêu cầu hệ thống.docx",
                        type: "DOCX",
                        size: "1.8 MB",
                        uploadDate: "05/08/2025",
                        url: "#",
                    },
                ],
                activities: [
                    {
                        id: "act1",
                        type: "milestone_completed",
                        user: "Nguyễn Văn A",
                        content: "Hoàn thành giai đoạn phân tích và thiết kế hệ thống",
                        timestamp: new Date(2025, 7, 31),
                    },
                ],
            },

            // Commercial Contract
            {
                id: "HD002",
                title: "Hợp đồng cung cấp thiết bị văn phòng",
                client: "Công ty XYZ Corp",
                startDate: "15/06/2025",
                endDate: "15/12/2025",
                status: "completed",
                progress: 100,
                value: "300,000,000 VNĐ",
                type: "commercial",
                description: "Cung cấp và lắp đặt thiết bị văn phòng cho trụ sở mới",
                createdDate: new Date(2025, 5, 15),
                owner: "Trần Thị B",
                category: "Thương mại",
                milestones: [
                    {
                        id: "m3",
                        title: "Khảo sát và báo giá",
                        description: "Khảo sát nhu cầu và đưa ra báo giá chi tiết",
                        startDate: "15/06/2025",
                        endDate: "30/06/2025",
                        status: "completed",
                        progress: 100,
                        paymentAmount: "30,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t5",
                                title: "Khảo sát hiện trạng",
                                description: "Đo đạc và khảo sát không gian văn phòng",
                                assignee: "Lê Văn C",
                                dueDate: "20/06/2025",
                                status: "completed",
                                priority: "high",
                            },
                        ],
                    },
                    {
                        id: "m4",
                        title: "Cung cấp và lắp đặt",
                        description: "Giao hàng và lắp đặt thiết bị theo thiết kế",
                        startDate: "01/07/2025",
                        endDate: "15/12/2025",
                        status: "completed",
                        progress: 100,
                        paymentAmount: "270,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t6",
                                title: "Giao hàng đợt 1",
                                description: "Giao thiết bị tầng 1-5",
                                assignee: "Phạm Văn D",
                                dueDate: "15/07/2025",
                                status: "completed",
                                priority: "medium",
                            },
                        ],
                    },
                ],
                partners: [
                    {
                        id: "p3",
                        name: "Hoàng Văn K",
                        role: "Procurement Manager - XYZ Corp",
                        contact: "0123456790",
                        email: "hoang.k@xyzcorp.com",
                    },
                ],
                attachments: [
                    {
                        id: "a3",
                        name: "Hợp đồng cung cấp thiết bị.pdf",
                        type: "PDF",
                        size: "1.8 MB",
                        uploadDate: "15/06/2025",
                        url: "#",
                    },
                ],
                activities: [
                    {
                        id: "act2",
                        type: "status_change",
                        user: "Trần Thị B",
                        content: "Hợp đồng đã hoàn thành và nghiệm thu",
                        timestamp: new Date(2025, 11, 15),
                    },
                ],
            },

            // Service Contract
            {
                id: "HD003",
                title: "Hợp đồng dịch vụ tư vấn marketing",
                client: "Startup DEF",
                startDate: "01/09/2025",
                endDate: "01/03/2026",
                status: "active",
                progress: 40,
                value: "150,000,000 VNĐ",
                type: "service",
                description: "Tư vấn chiến lược marketing và xây dựng thương hiệu",
                createdDate: new Date(2025, 8, 1),
                owner: "Lê Thị C",
                category: "Dịch vụ",
                milestones: [
                    {
                        id: "m5",
                        title: "Nghiên cứu thị trường",
                        description: "Phân tích thị trường và đối thủ cạnh tranh",
                        startDate: "01/09/2025",
                        endDate: "30/09/2025",
                        status: "completed",
                        progress: 100,
                        paymentAmount: "45,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t7",
                                title: "Khảo sát khách hàng mục tiêu",
                                description: "Thực hiện survey và focus group",
                                assignee: "Nguyễn Văn E",
                                dueDate: "15/09/2025",
                                status: "completed",
                                priority: "high",
                            },
                        ],
                    },
                    {
                        id: "m6",
                        title: "Xây dựng chiến lược",
                        description: "Phát triển chiến lược marketing tổng thể",
                        startDate: "01/10/2025",
                        endDate: "31/12/2025",
                        status: "in-progress",
                        progress: 60,
                        paymentAmount: "60,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t8",
                                title: "Thiết kế brand identity",
                                description: "Tạo logo và hệ thống nhận diện thương hiệu",
                                assignee: "Trần Thị F",
                                dueDate: "15/11/2025",
                                status: "in-progress",
                                priority: "high",
                            },
                        ],
                    },
                ],
                partners: [
                    {
                        id: "p4",
                        name: "Vũ Minh L",
                        role: "CEO - Startup DEF",
                        contact: "0123456791",
                        email: "minh.l@startupdef.com",
                    },
                ],
                attachments: [
                    {
                        id: "a4",
                        name: "Hợp đồng tư vấn marketing.pdf",
                        type: "PDF",
                        size: "2.1 MB",
                        uploadDate: "01/09/2025",
                        url: "#",
                    },
                ],
                activities: [
                    {
                        id: "act3",
                        type: "comment",
                        user: "Lê Thị C",
                        content: "Đã hoàn thành nghiên cứu thị trường, bắt đầu giai đoạn xây dựng chiến lược",
                        timestamp: new Date(2025, 9, 1),
                    },
                ],
            },

            // Legal Contract
            {
                id: "HD004",
                title: "Hợp đồng tư vấn pháp lý doanh nghiệp",
                client: "Công ty GHI Holdings",
                startDate: "15/07/2025",
                endDate: "15/01/2026",
                status: "active",
                progress: 75,
                value: "200,000,000 VNĐ",
                type: "legal",
                description: "Tư vấn pháp lý toàn diện cho hoạt động kinh doanh và M&A",
                createdDate: new Date(2025, 6, 15),
                owner: "Phạm Văn D",
                category: "Pháp lý",
                milestones: [
                    {
                        id: "m7",
                        title: "Audit pháp lý",
                        description: "Rà soát toàn bộ tài liệu pháp lý của công ty",
                        startDate: "15/07/2025",
                        endDate: "31/08/2025",
                        status: "completed",
                        progress: 100,
                        paymentAmount: "80,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t9",
                                title: "Rà soát hợp đồng hiện tại",
                                description: "Kiểm tra tính hợp pháp của các hợp đồng",
                                assignee: "Đỗ Thị G",
                                dueDate: "31/07/2025",
                                status: "completed",
                                priority: "high",
                            },
                        ],
                    },
                    {
                        id: "m8",
                        title: "Tư vấn M&A",
                        description: "Hỗ trợ pháp lý cho giao dịch mua bán sáp nhập",
                        startDate: "01/09/2025",
                        endDate: "15/01/2026",
                        status: "in-progress",
                        progress: 70,
                        paymentAmount: "120,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t10",
                                title: "Due diligence công ty mục tiêu",
                                description: "Thẩm định pháp lý công ty được mua",
                                assignee: "Vũ Văn H",
                                dueDate: "30/11/2025",
                                status: "in-progress",
                                priority: "high",
                            },
                        ],
                    },
                ],
                partners: [
                    {
                        id: "p5",
                        name: "Bùi Văn M",
                        role: "Legal Director - GHI Holdings",
                        contact: "0123456792",
                        email: "bui.m@ghiholdings.com",
                    },
                ],
                attachments: [
                    {
                        id: "a5",
                        name: "Hợp đồng tư vấn pháp lý.pdf",
                        type: "PDF",
                        size: "3.2 MB",
                        uploadDate: "15/07/2025",
                        url: "#",
                    },
                ],
                activities: [
                    {
                        id: "act4",
                        type: "milestone_completed",
                        user: "Phạm Văn D",
                        content: "Hoàn thành audit pháp lý, phát hiện 3 vấn đề cần xử lý",
                        timestamp: new Date(2025, 7, 31),
                    },
                ],
            },

            // Rental Contract
            {
                id: "HD005",
                title: "Hợp đồng thuê văn phòng trung tâm",
                client: "Công ty JKL Solutions",
                startDate: "01/10/2025",
                endDate: "01/10/2027",
                status: "pending",
                progress: 25,
                value: "480,000,000 VNĐ",
                type: "rental",
                description: "Thuê văn phòng 500m² tại tòa nhà ABC Tower trong 2 năm",
                createdDate: new Date(2025, 9, 1),
                owner: "Hoàng Thị E",
                category: "Thuê mặt bằng",
                milestones: [
                    {
                        id: "m9",
                        title: "Ký kết và bàn giao",
                        description: "Hoàn tất thủ tục pháp lý và bàn giao mặt bằng",
                        startDate: "01/10/2025",
                        endDate: "15/10/2025",
                        status: "pending",
                        progress: 50,
                        paymentAmount: "120,000,000 VNĐ",
                        tasks: [
                            {
                                id: "t11",
                                title: "Kiểm tra hiện trạng văn phòng",
                                description: "Khảo sát và ghi nhận hiện trạng",
                                assignee: "Lê Văn I",
                                dueDate: "05/10/2025",
                                status: "pending",
                                priority: "high",
                            },
                        ],
                    },
                ],
                partners: [
                    {
                        id: "p6",
                        name: "Cao Văn N",
                        role: "Facility Manager - JKL Solutions",
                        contact: "0123456793",
                        email: "cao.n@jklsolutions.com",
                    },
                ],
                attachments: [
                    {
                        id: "a6",
                        name: "Hợp đồng thuê văn phòng.pdf",
                        type: "PDF",
                        size: "2.8 MB",
                        uploadDate: "01/10/2025",
                        url: "#",
                    },
                ],
                activities: [
                    {
                        id: "act5",
                        type: "comment",
                        user: "Hoàng Thị E",
                        content: "Đang chờ khách hàng hoàn tất thủ tục pháp lý",
                        timestamp: new Date(2025, 9, 5),
                    },
                ],
            },
        ];
    };

    useEffect(() => {
        // Simulate API call
        const loadContracts = async () => {
            try {
                setLoading(true);
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const sampleData = generateSampleData();
                setContracts(sampleData);
            } catch (err) {
                setError("Không thể tải dữ liệu hợp đồng");
            } finally {
                setLoading(false);
            }
        };

        loadContracts();
    }, []);

    const getContractById = (id: string): Contract | undefined => {
        return contracts.find((contract) => contract.id === id);
    };

    const updateContract = (id: string, updates: Partial<Contract>) => {
        setContracts((prev) => prev.map((contract) => (contract.id === id ? { ...contract, ...updates } : contract)));
    };

    const addComment = (contractId: string, comment: string) => {
        const newActivity: Activity = {
            id: `act_${Date.now()}`,
            type: "comment",
            user: "Current User", // In real app, get from auth context
            content: comment,
            timestamp: new Date(),
        };

        setContracts((prev) =>
            prev.map((contract) =>
                contract.id === contractId ? { ...contract, activities: [...contract.activities, newActivity] } : contract,
            ),
        );
    };

    const value: ContractContextType = {
        contracts,
        loading,
        error,
        getContractById,
        updateContract,
        addComment,
    };

    return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};
