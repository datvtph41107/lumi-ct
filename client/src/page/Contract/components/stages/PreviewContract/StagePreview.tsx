// import type React from "react";
// import { useState } from "react";
// import classNames from "classnames/bind";
// import styles from "./StagePreview.module.scss";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ProgressSidebar } from "../../Sidebar/ProgressSidebar";
// import { ContractSummary } from "../../Sidebar/ContractSummary";
// import {
//     faFileContract,
//     faChevronLeft,
//     faChevronRight,
//     faEdit,
//     faSave,
//     faTimes,
//     faDownload,
//     faPrint,
//     faShare,
//     faExclamationTriangle,
//     faUpload,
//     faCheck,
//     faCalendar,
//     faUser,
//     faDollarSign,
//     faBuilding,
//     faPlus,
//     faClock,
//     faCheckCircle,
// } from "@fortawesome/free-solid-svg-icons";
// import { useContractForm } from "~/hooks/useContractForm";

// const cx = classNames.bind(styles);

// interface Task {
//     id: string;
//     name: string;
//     description: string;
//     assignee: string;
//     estimatedHours: number;
//     completed: boolean;
// }

// interface Milestone {
//     id: string;
//     name: string;
//     description: string;
//     dueDate: string;
//     priority: "low" | "medium" | "high" | "critical";
//     assignee: string;
//     tasks: Task[];
//     status: "pending" | "in-progress" | "completed";
// }

// interface ContractData {
//     contractType: string;
//     title: string;
//     creationDate: string;
//     dateRange: {
//         startDate: string;
//         endDate: string;
//     };
//     details: {
//         description: string;
//         contractValue: number;
//         vendorName: string;
//         department: string;
//         contactPerson: string;
//         email: string;
//         phone: string;
//     };
//     terms: {
//         paymentTerms: string;
//         deliveryTerms: string;
//         warrantyPeriod: string;
//         penaltyClause: string;
//     };
// }

// const StagePreview: React.FC = () => {
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//     const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "terms" | "documents">("overview");
//     const [editingSection, setEditingSection] = useState<string | null>(null);
//     const [contractData, setContractData] = useState<ContractData>({
//         contractType: "service",
//         title: "Hợp đồng phát triển phần mềm quản lý nhân sự",
//         creationDate: new Date().toISOString(),
//         dateRange: {
//             startDate: new Date().toISOString(),
//             endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
//         },
//         details: {
//             description:
//                 "Phát triển hệ thống quản lý nhân sự toàn diện cho doanh nghiệp, bao gồm các module quản lý thông tin nhân viên, chấm công, tính lương và báo cáo.",
//             contractValue: 500000000,
//             vendorName: "Công ty TNHH Công nghệ ABC",
//             department: "Phòng IT",
//             contactPerson: "Nguyễn Văn A",
//             email: "contact@abc-tech.com",
//             phone: "0123456789",
//         },
//         terms: {
//             paymentTerms: "Thanh toán theo từng giai đoạn: 30% khi ký hợp đồng, 40% khi hoàn thành 50% công việc, 30% khi nghiệm thu",
//             deliveryTerms: "Giao hàng tại trụ sở công ty trong vòng 90 ngày kể từ ngày ký hợp đồng",
//             warrantyPeriod: "12 tháng bảo hành kể từ ngày nghiệm thu",
//             penaltyClause: "Phạt 0.1%/ngày trên tổng giá trị hợp đồng nếu chậm tiến độ",
//         },
//     });

//     const { formData } = useContractForm();

//     console.log("PREVIEW DATA: ", formData);

//     const [showAddTerm, setShowAddTerm] = useState(false);
//     const [newTermType, setNewTermType] = useState("");
//     const [newTermContent, setNewTermContent] = useState("");
//     const [customTermName, setCustomTermName] = useState("");

//     const milestones: Milestone[] = [
//         {
//             id: "1",
//             name: "Phân tích và thiết kế hệ thống",
//             description: "Thu thập yêu cầu, phân tích nghiệp vụ và thiết kế kiến trúc hệ thống",
//             dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
//             priority: "high",
//             assignee: "Nguyễn Văn A",
//             status: "pending",
//             tasks: [
//                 {
//                     id: "t1",
//                     name: "Thu thập yêu cầu từ khách hàng",
//                     description: "Họp với stakeholders để xác định yêu cầu chi tiết",
//                     assignee: "Nguyễn Văn A",
//                     estimatedHours: 16,
//                     completed: false,
//                 },
//                 {
//                     id: "t2",
//                     name: "Thiết kế database",
//                     description: "Thiết kế cấu trúc cơ sở dữ liệu",
//                     assignee: "Trần Thị B",
//                     estimatedHours: 24,
//                     completed: false,
//                 },
//             ],
//         },
//         {
//             id: "2",
//             name: "Phát triển module quản lý nhân viên",
//             description: "Xây dựng các chức năng CRUD cho thông tin nhân viên",
//             dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
//             priority: "high",
//             assignee: "Lê Văn C",
//             status: "pending",
//             tasks: [
//                 {
//                     id: "t3",
//                     name: "Phát triển API backend",
//                     description: "Xây dựng REST API cho module nhân viên",
//                     assignee: "Lê Văn C",
//                     estimatedHours: 40,
//                     completed: false,
//                 },
//                 {
//                     id: "t4",
//                     name: "Phát triển giao diện người dùng",
//                     description: "Xây dựng UI/UX cho module nhân viên",
//                     assignee: "Phạm Thị D",
//                     estimatedHours: 32,
//                     completed: false,
//                 },
//             ],
//         },
//     ];

//     const formatDate = (dateString: string) => {
//         return new Date(dateString).toLocaleDateString("vi-VN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//         });
//     };

//     const formatCurrency = (amount: number) => {
//         return new Intl.NumberFormat("vi-VN", {
//             style: "currency",
//             currency: "VND",
//         }).format(amount);
//     };

//     const handleEdit = (section: string) => {
//         setEditingSection(section);
//     };

//     const handleSave = (section: string) => {
//         setEditingSection(null);
//         // Here you would save the data
//     };

//     const handleCancel = () => {
//         setEditingSection(null);
//         // Here you would revert changes
//     };

//     const EditableField: React.FC<{
//         label: string;
//         value: string | number;
//         field: string;
//         section: string;
//         type?: "text" | "number" | "textarea" | "date";
//         prefix?: string;
//     }> = ({ label, value, field, section, type = "text", prefix }) => {
//         const isEditing = editingSection === section;
//         const [editValue, setEditValue] = useState(value);

//         const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//             setEditValue(e.target.value);
//         };

//         return (
//             <div className={cx("editable-field")}>
//                 <label>{label}:</label>
//                 {isEditing ? (
//                     type === "textarea" ? (
//                         <textarea value={editValue} onChange={handleChange} className={cx("edit-input", "textarea")} rows={3} />
//                     ) : (
//                         <input type={type} value={editValue} onChange={handleChange} className={cx("edit-input")} />
//                     )
//                 ) : (
//                     <span className={cx("field-value")}>
//                         {prefix && `${prefix} `}
//                         {type === "number" && typeof value === "number" ? formatCurrency(value) : value}
//                     </span>
//                 )}
//             </div>
//         );
//     };

//     const handleRemoveTerm = (termKey: string) => {
//         setContractData((prev) => ({
//             ...prev,
//             terms: {
//                 ...prev.terms,
//                 [termKey]: "",
//             },
//         }));
//     };

//     const handleAddTerm = () => {
//         if (!newTermType || !newTermContent) return;

//         const termKey = newTermType === "custom" ? customTermName.toLowerCase().replace(/\s+/g, "") : newTermType;

//         setContractData((prev) => ({
//             ...prev,
//             terms: {
//                 ...prev.terms,
//                 [termKey]: newTermContent,
//             },
//         }));

//         setShowAddTerm(false);
//         setNewTermType("");
//         setNewTermContent("");
//         setCustomTermName("");
//     };

//     const getPriorityBadge = (priority: string) => {
//         let badgeClass = "";
//         switch (priority) {
//             case "low":
//                 badgeClass = "low-priority";
//                 break;
//             case "medium":
//                 badgeClass = "medium-priority";
//                 break;
//             case "high":
//                 badgeClass = "high-priority";
//                 break;
//             case "critical":
//                 badgeClass = "critical-priority";
//                 break;
//             default:
//                 badgeClass = "low-priority";
//         }

//         return <span className={cx("priority-badge", badgeClass)}>{priority}</span>;
//     };

//     const getStatusBadge = (status: string) => {
//         let badgeClass = "";
//         switch (status) {
//             case "pending":
//                 badgeClass = "pending-status";
//                 break;
//             case "in-progress":
//                 badgeClass = "in-progress-status";
//                 break;
//             case "completed":
//                 badgeClass = "completed-status";
//                 break;
//             default:
//                 badgeClass = "pending-status";
//         }

//         return <span className={cx("status-badge", badgeClass)}>{status}</span>;
//     };

//     return (
//         <div className={cx("container")}>
//             <div className={cx("wrapper")}>
//                 <div className={cx("form-header")}>
//                     <h1>
//                         <FontAwesomeIcon icon={faFileContract} />
//                         Xem lại thông tin hợp đồng - Giai đoạn cuối
//                     </h1>
//                     <p>Kiểm tra và chỉnh sửa thông tin cuối cùng trước khi hoàn tất tạo hợp đồng</p>
//                 </div>

//                 <div className={cx("mainGrid", { sidebarCollapsed })}>
//                     {/* Main Content */}
//                     <div className={cx("main-content")}>
//                         {/* Contract Header */}
//                         <div className={cx("contract-header")}>
//                             <div className={cx("contract-title")}>
//                                 <h2>{contractData.title}</h2>
//                                 <div className={cx("contract-meta")}>
//                                     <span className={cx("contract-type")}>Hợp đồng dịch vụ</span>
//                                     <span className={cx("creation-date")}>Tạo ngày {formatDate(contractData.creationDate)}</span>
//                                 </div>
//                             </div>
//                             <div className={cx("header-actions")}>
//                                 <button className={cx("button", "outline")}>
//                                     <FontAwesomeIcon icon={faPrint} />
//                                     In bản nháp
//                                 </button>
//                                 <button className={cx("button", "primary")}>
//                                     <FontAwesomeIcon icon={faDownload} />
//                                     Xuất PDF
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Tab Navigation */}
//                         <div className={cx("tab-navigation")}>
//                             <button
//                                 className={cx("tab-button", { active: activeTab === "overview" })}
//                                 onClick={() => setActiveTab("overview")}
//                             >
//                                 Thông tin cơ bản
//                             </button>
//                             <button
//                                 className={cx("tab-button", { active: activeTab === "milestones" })}
//                                 onClick={() => setActiveTab("milestones")}
//                             >
//                                 Kế hoạch thực hiện
//                             </button>
//                             <button className={cx("tab-button", { active: activeTab === "terms" })} onClick={() => setActiveTab("terms")}>
//                                 Điều khoản
//                             </button>
//                             <button
//                                 className={cx("tab-button", { active: activeTab === "documents" })}
//                                 onClick={() => setActiveTab("documents")}
//                             >
//                                 Tài liệu
//                             </button>
//                         </div>

//                         {/* Tab Content */}
//                         <div className={cx("tab-content")}>
//                             {activeTab === "overview" && (
//                                 <div className={cx("overview-content")}>
//                                     {/* Basic Information */}
//                                     <div className={cx("content-section")}>
//                                         <div className={cx("section-header")}>
//                                             <h3>Thông tin cơ bản</h3>
//                                             <div className={cx("section-actions")}>
//                                                 {editingSection === "basic" ? (
//                                                     <>
//                                                         <button
//                                                             onClick={() => handleSave("basic")}
//                                                             className={cx("button", "primary", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faSave} />
//                                                             Lưu
//                                                         </button>
//                                                         <button onClick={handleCancel} className={cx("button", "ghost", "small")}>
//                                                             <FontAwesomeIcon icon={faTimes} />
//                                                             Hủy
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <button onClick={() => handleEdit("basic")} className={cx("button", "ghost", "small")}>
//                                                         <FontAwesomeIcon icon={faEdit} />
//                                                         Chỉnh sửa
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className={cx("detail-grid")}>
//                                             <EditableField label="Tên hợp đồng" value={contractData.title} field="title" section="basic" />
//                                             <EditableField
//                                                 label="Loại hợp đồng"
//                                                 value="Hợp đồng dịch vụ"
//                                                 field="contractType"
//                                                 section="basic"
//                                             />
//                                             <EditableField
//                                                 label="Ngày bắt đầu"
//                                                 value={formatDate(contractData.dateRange.startDate)}
//                                                 field="startDate"
//                                                 section="basic"
//                                                 type="date"
//                                             />
//                                             <EditableField
//                                                 label="Ngày kết thúc"
//                                                 value={formatDate(contractData.dateRange.endDate)}
//                                                 field="endDate"
//                                                 section="basic"
//                                                 type="date"
//                                             />
//                                             <EditableField
//                                                 label="Giá trị hợp đồng"
//                                                 value={contractData.details.contractValue}
//                                                 field="contractValue"
//                                                 section="basic"
//                                                 type="number"
//                                             />
//                                             <EditableField
//                                                 label="Phòng ban phụ trách"
//                                                 value={contractData.details.department}
//                                                 field="department"
//                                                 section="basic"
//                                             />
//                                         </div>
//                                         <div className={cx("description-section")}>
//                                             <EditableField
//                                                 label="Mô tả dự án"
//                                                 value={contractData.details.description}
//                                                 field="description"
//                                                 section="basic"
//                                                 type="textarea"
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Vendor Information */}
//                                     <div className={cx("content-section")}>
//                                         <div className={cx("section-header")}>
//                                             <h3>Thông tin đối tác</h3>
//                                             <div className={cx("section-actions")}>
//                                                 {editingSection === "vendor" ? (
//                                                     <>
//                                                         <button
//                                                             onClick={() => handleSave("vendor")}
//                                                             className={cx("button", "primary", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faSave} />
//                                                             Lưu
//                                                         </button>
//                                                         <button onClick={handleCancel} className={cx("button", "ghost", "small")}>
//                                                             <FontAwesomeIcon icon={faTimes} />
//                                                             Hủy
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <button onClick={() => handleEdit("vendor")} className={cx("button", "ghost", "small")}>
//                                                         <FontAwesomeIcon icon={faEdit} />
//                                                         Chỉnh sửa
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className={cx("detail-grid")}>
//                                             <EditableField
//                                                 label="Tên công ty"
//                                                 value={contractData.details.vendorName}
//                                                 field="vendorName"
//                                                 section="vendor"
//                                             />
//                                             <EditableField
//                                                 label="Người liên hệ"
//                                                 value={contractData.details.contactPerson}
//                                                 field="contactPerson"
//                                                 section="vendor"
//                                             />
//                                             <EditableField
//                                                 label="Email"
//                                                 value={contractData.details.email}
//                                                 field="email"
//                                                 section="vendor"
//                                             />
//                                             <EditableField
//                                                 label="Số điện thoại"
//                                                 value={contractData.details.phone}
//                                                 field="phone"
//                                                 section="vendor"
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Summary Statistics */}
//                                     <div className={cx("content-section")}>
//                                         <h3>Tóm tắt dự án</h3>
//                                         <div className={cx("summary-stats")}>
//                                             <div className={cx("stat-card")}>
//                                                 <FontAwesomeIcon icon={faCalendar} className={cx("stat-icon")} />
//                                                 <div className={cx("stat-info")}>
//                                                     <div className={cx("stat-number")}>90</div>
//                                                     <div className={cx("stat-label")}>Ngày thực hiện</div>
//                                                 </div>
//                                             </div>
//                                             <div className={cx("stat-card")}>
//                                                 <FontAwesomeIcon icon={faUser} className={cx("stat-icon")} />
//                                                 <div className={cx("stat-info")}>
//                                                     <div className={cx("stat-number")}>{milestones.length}</div>
//                                                     <div className={cx("stat-label")}>Giai đoạn</div>
//                                                 </div>
//                                             </div>
//                                             <div className={cx("stat-card")}>
//                                                 <FontAwesomeIcon icon={faDollarSign} className={cx("stat-icon")} />
//                                                 <div className={cx("stat-info")}>
//                                                     <div className={cx("stat-number")}>500M</div>
//                                                     <div className={cx("stat-label")}>VNĐ</div>
//                                                 </div>
//                                             </div>
//                                             <div className={cx("stat-card")}>
//                                                 <FontAwesomeIcon icon={faBuilding} className={cx("stat-icon")} />
//                                                 <div className={cx("stat-info")}>
//                                                     <div className={cx("stat-number")}>IT</div>
//                                                     <div className={cx("stat-label")}>Phòng ban</div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === "milestones" && (
//                                 <div className={cx("milestones-content")}>
//                                     <div className={cx("content-section")}>
//                                         <div className={cx("section-header")}>
//                                             <h3>Kế hoạch thực hiện dự án</h3>
//                                             <div className={cx("section-actions")}>
//                                                 {editingSection === "milestones" ? (
//                                                     <>
//                                                         <button
//                                                             onClick={() => handleSave("milestones")}
//                                                             className={cx("button", "primary", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faSave} />
//                                                             Lưu
//                                                         </button>
//                                                         <button onClick={handleCancel} className={cx("button", "ghost", "small")}>
//                                                             <FontAwesomeIcon icon={faTimes} />
//                                                             Hủy
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <button
//                                                         onClick={() => handleEdit("milestones")}
//                                                         className={cx("button", "ghost", "small")}
//                                                     >
//                                                         <FontAwesomeIcon icon={faEdit} />
//                                                         Chỉnh sửa
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div className={cx("milestones-timeline")}>
//                                             {milestones.map((milestone, index) => (
//                                                 <div key={milestone.id} className={cx("milestone-detail-card")}>
//                                                     <div className={cx("milestone-header")}>
//                                                         <div className={cx("milestone-number")}>{index + 1}</div>
//                                                         <div className={cx("milestone-info")}>
//                                                             <div className={cx("milestone-title-row")}>
//                                                                 <h4>{milestone.name}</h4>
//                                                                 <div className={cx("milestone-badges")}>
//                                                                     {getPriorityBadge(milestone.priority)}
//                                                                     {getStatusBadge(milestone.status)}
//                                                                 </div>
//                                                             </div>
//                                                             <p className={cx("milestone-description")}>{milestone.description}</p>
//                                                             <div className={cx("milestone-meta-grid")}>
//                                                                 <div className={cx("meta-item")}>
//                                                                     <FontAwesomeIcon icon={faCalendar} />
//                                                                     <span>Hạn: {formatDate(milestone.dueDate)}</span>
//                                                                 </div>
//                                                                 <div className={cx("meta-item")}>
//                                                                     <FontAwesomeIcon icon={faUser} />
//                                                                     <span>PIC: {milestone.assignee}</span>
//                                                                 </div>
//                                                                 <div className={cx("meta-item")}>
//                                                                     <FontAwesomeIcon icon={faClock} />
//                                                                     <span>
//                                                                         Tổng thời gian:{" "}
//                                                                         {milestone.tasks.reduce(
//                                                                             (total, task) => total + task.estimatedHours,
//                                                                             0,
//                                                                         )}
//                                                                         h
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {milestone.tasks.length > 0 && (
//                                                         <div className={cx("milestone-tasks-section")}>
//                                                             <h5>Công việc chi tiết ({milestone.tasks.length}):</h5>
//                                                             <div className={cx("tasks-grid")}>
//                                                                 {milestone.tasks.map((task) => (
//                                                                     <div
//                                                                         key={task.id}
//                                                                         className={cx("task-detail-card", { completed: task.completed })}
//                                                                     >
//                                                                         <div className={cx("task-header")}>
//                                                                             <div className={cx("task-status")}>
//                                                                                 <FontAwesomeIcon
//                                                                                     icon={task.completed ? faCheckCircle : faClock}
//                                                                                     className={cx("task-status-icon", {
//                                                                                         completed: task.completed,
//                                                                                     })}
//                                                                                 />
//                                                                             </div>
//                                                                             <div className={cx("task-content")}>
//                                                                                 <h6
//                                                                                     className={cx("task-name", {
//                                                                                         completed: task.completed,
//                                                                                     })}
//                                                                                 >
//                                                                                     {task.name}
//                                                                                 </h6>
//                                                                                 {task.description && (
//                                                                                     <p className={cx("task-description")}>
//                                                                                         {task.description}
//                                                                                     </p>
//                                                                                 )}
//                                                                                 <div className={cx("task-meta")}>
//                                                                                     <div className={cx("task-meta-item")}>
//                                                                                         <FontAwesomeIcon icon={faUser} />
//                                                                                         <span>{task.assignee}</span>
//                                                                                     </div>
//                                                                                     <div className={cx("task-meta-item")}>
//                                                                                         <FontAwesomeIcon icon={faClock} />
//                                                                                         <span>{task.estimatedHours}h</span>
//                                                                                     </div>
//                                                                                 </div>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))}
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     <div className={cx("milestone-summary")}>
//                                                         <div className={cx("summary-item")}>
//                                                             <span className={cx("summary-label")}>Tiến độ:</span>
//                                                             <div className={cx("progress-indicator")}>
//                                                                 <div className={cx("progress-bar")}>
//                                                                     <div
//                                                                         className={cx("progress-fill")}
//                                                                         style={{
//                                                                             width: `${
//                                                                                 (milestone.tasks.filter((t) => t.completed).length /
//                                                                                     milestone.tasks.length) *
//                                                                                 100
//                                                                             }%`,
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                                 <span className={cx("progress-text")}>
//                                                                     {milestone.tasks.filter((t) => t.completed).length}/
//                                                                     {milestone.tasks.length} hoàn thành
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         <div className={cx("milestones-overview")}>
//                                             <h4>Tổng quan dự án</h4>
//                                             <div className={cx("overview-stats")}>
//                                                 <div className={cx("overview-stat")}>
//                                                     <span className={cx("stat-label")}>Tổng thời gian ước tính:</span>
//                                                     <span className={cx("stat-value")}>
//                                                         {milestones.reduce(
//                                                             (total, m) =>
//                                                                 total +
//                                                                 m.tasks.reduce((taskTotal, task) => taskTotal + task.estimatedHours, 0),
//                                                             0,
//                                                         )}
//                                                         h
//                                                     </span>
//                                                 </div>
//                                                 <div className={cx("overview-stat")}>
//                                                     <span className={cx("stat-label")}>Thời gian thực hiện:</span>
//                                                     <span className={cx("stat-value")}>
//                                                         {Math.ceil(
//                                                             (new Date(contractData.dateRange.endDate).getTime() -
//                                                                 new Date(contractData.dateRange.startDate).getTime()) /
//                                                                 (1000 * 60 * 60 * 24),
//                                                         )}{" "}
//                                                         ngày
//                                                     </span>
//                                                 </div>
//                                                 <div className={cx("overview-stat")}>
//                                                     <span className={cx("stat-label")}>Số lượng nhân sự tham gia:</span>
//                                                     <span className={cx("stat-value")}>
//                                                         {
//                                                             new Set([
//                                                                 ...milestones.map((m) => m.assignee),
//                                                                 ...milestones.flatMap((m) => m.tasks.map((t) => t.assignee)),
//                                                             ]).size
//                                                         }{" "}
//                                                         người
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === "terms" && (
//                                 <div className={cx("terms-content")}>
//                                     <div className={cx("content-section")}>
//                                         <div className={cx("section-header")}>
//                                             <h3>Điều khoản hợp đồng</h3>
//                                             <div className={cx("section-actions")}>
//                                                 {editingSection === "terms" ? (
//                                                     <>
//                                                         <button
//                                                             onClick={() => handleSave("terms")}
//                                                             className={cx("button", "primary", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faSave} />
//                                                             Lưu
//                                                         </button>
//                                                         <button onClick={handleCancel} className={cx("button", "ghost", "small")}>
//                                                             <FontAwesomeIcon icon={faTimes} />
//                                                             Hủy
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <button
//                                                             onClick={() => handleEdit("terms")}
//                                                             className={cx("button", "ghost", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faEdit} />
//                                                             Chỉnh sửa
//                                                         </button>
//                                                         <button
//                                                             onClick={() => setShowAddTerm(true)}
//                                                             className={cx("button", "outline", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faPlus} />
//                                                             Thêm điều khoản
//                                                         </button>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div className={cx("terms-list")}>
//                                             {Object.entries(contractData.terms).map(([key, value]) => {
//                                                 if (!value) return null; // Chỉ hiển thị nếu có giá trị

//                                                 const termLabels = {
//                                                     paymentTerms: "Điều khoản thanh toán",
//                                                     deliveryTerms: "Điều khoản giao hàng",
//                                                     warrantyPeriod: "Thời gian bảo hành",
//                                                     penaltyClause: "Điều khoản phạt",
//                                                 };

//                                                 return (
//                                                     <div key={key} className={cx("term-item")}>
//                                                         <div className={cx("term-header")}>
//                                                             <h5>{termLabels[key as keyof typeof termLabels]}</h5>
//                                                             {editingSection !== "terms" && (
//                                                                 <button
//                                                                     onClick={() => handleRemoveTerm(key)}
//                                                                     className={cx("button", "ghost", "small", "danger")}
//                                                                     title="Xóa điều khoản"
//                                                                 >
//                                                                     <FontAwesomeIcon icon={faTimes} />
//                                                                 </button>
//                                                             )}
//                                                         </div>
//                                                         <EditableField label="" value={value} field={key} section="terms" type="textarea" />
//                                                     </div>
//                                                 );
//                                             })}

//                                             {Object.values(contractData.terms).every((term) => !term) && (
//                                                 <div className={cx("empty-terms")}>
//                                                     <FontAwesomeIcon icon={faFileContract} className={cx("empty-icon")} />
//                                                     <p>Chưa có điều khoản nào được thiết lập</p>
//                                                     <button onClick={() => setShowAddTerm(true)} className={cx("button", "primary")}>
//                                                         <FontAwesomeIcon icon={faPlus} />
//                                                         Thêm điều khoản đầu tiên
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Add Term Modal */}
//                                         {showAddTerm && (
//                                             <div className={cx("modal-overlay")}>
//                                                 <div className={cx("modal", "add-term-modal")}>
//                                                     <div className={cx("modal-header")}>
//                                                         <h4>Thêm điều khoản mới</h4>
//                                                         <button
//                                                             onClick={() => setShowAddTerm(false)}
//                                                             className={cx("button", "ghost", "small")}
//                                                         >
//                                                             <FontAwesomeIcon icon={faTimes} />
//                                                         </button>
//                                                     </div>
//                                                     <div className={cx("modal-content")}>
//                                                         <div className={cx("form-group")}>
//                                                             <label>Loại điều khoản:</label>
//                                                             <select
//                                                                 value={newTermType}
//                                                                 onChange={(e) => setNewTermType(e.target.value)}
//                                                                 className={cx("form-input")}
//                                                             >
//                                                                 <option value="">-- Chọn loại điều khoản --</option>
//                                                                 <option value="paymentTerms">Điều khoản thanh toán</option>
//                                                                 <option value="deliveryTerms">Điều khoản giao hàng</option>
//                                                                 <option value="warrantyPeriod">Thời gian bảo hành</option>
//                                                                 <option value="penaltyClause">Điều khoản phạt</option>
//                                                                 <option value="custom">Điều khoản tùy chỉnh</option>
//                                                             </select>
//                                                         </div>
//                                                         {newTermType === "custom" && (
//                                                             <div className={cx("form-group")}>
//                                                                 <label>Tên điều khoản:</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     value={customTermName}
//                                                                     onChange={(e) => setCustomTermName(e.target.value)}
//                                                                     placeholder="Nhập tên điều khoản"
//                                                                     className={cx("form-input")}
//                                                                 />
//                                                             </div>
//                                                         )}
//                                                         <div className={cx("form-group")}>
//                                                             <label>Nội dung:</label>
//                                                             <textarea
//                                                                 value={newTermContent}
//                                                                 onChange={(e) => setNewTermContent(e.target.value)}
//                                                                 placeholder="Nhập nội dung điều khoản"
//                                                                 rows={4}
//                                                                 className={cx("form-input")}
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                     <div className={cx("modal-actions")}>
//                                                         <button onClick={handleAddTerm} className={cx("button", "primary")}>
//                                                             Thêm điều khoản
//                                                         </button>
//                                                         <button onClick={() => setShowAddTerm(false)} className={cx("button", "outline")}>
//                                                             Hủy
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === "documents" && (
//                                 <div className={cx("documents-content")}>
//                                     <div className={cx("content-section")}>
//                                         <h3>Tài liệu đính kèm</h3>
//                                         <div className={cx("upload-area")}>
//                                             <FontAwesomeIcon icon={faUpload} className={cx("upload-icon")} />
//                                             <p>Kéo thả tài liệu vào đây hoặc</p>
//                                             <button className={cx("button", "outline")}>Chọn tệp</button>
//                                             <small>Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX (tối đa 10MB)</small>
//                                         </div>
//                                         <div className={cx("documents-list")}>
//                                             <div className={cx("document-item")}>
//                                                 <FontAwesomeIcon icon={faFileContract} className={cx("doc-icon")} />
//                                                 <div className={cx("doc-info")}>
//                                                     <span className={cx("doc-name")}>Bản mẫu hợp đồng.pdf</span>
//                                                     <span className={cx("doc-size")}>2.4 MB</span>
//                                                 </div>
//                                                 <div className={cx("doc-actions")}>
//                                                     <button className={cx("button", "ghost", "small")}>
//                                                         <FontAwesomeIcon icon={faDownload} />
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                             <div className={cx("document-item")}>
//                                                 <FontAwesomeIcon icon={faFileContract} className={cx("doc-icon")} />
//                                                 <div className={cx("doc-info")}>
//                                                     <span className={cx("doc-name")}>Yêu cầu kỹ thuật.docx</span>
//                                                     <span className={cx("doc-size")}>1.8 MB</span>
//                                                 </div>
//                                                 <div className={cx("doc-actions")}>
//                                                     <button className={cx("button", "ghost", "small")}>
//                                                         <FontAwesomeIcon icon={faDownload} />
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right Sidebar */}
//                     <div className={cx("right-sidebar")}>
//                         <div className={cx("sidebar-section")}>
//                             <h4>Trạng thái xem xét</h4>
//                             <div className={cx("review-checklist")}>
//                                 <div className={cx("check-item", "completed")}>
//                                     <FontAwesomeIcon icon={faCheck} />
//                                     <span>Thông tin cơ bản đầy đủ</span>
//                                 </div>
//                                 <div className={cx("check-item", "completed")}>
//                                     <FontAwesomeIcon icon={faCheck} />
//                                     <span>Thông tin đối tác chính xác</span>
//                                 </div>
//                                 <div className={cx("check-item", "completed")}>
//                                     <FontAwesomeIcon icon={faCheck} />
//                                     <span>Kế hoạch thực hiện rõ ràng</span>
//                                 </div>
//                                 <div className={cx("check-item", "warning")}>
//                                     <FontAwesomeIcon icon={faExclamationTriangle} />
//                                     <span>Cần bổ sung điều khoản</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className={cx("sidebar-section")}>
//                             <h4>Người phụ trách</h4>
//                             <div className={cx("assignee-item")}>
//                                 <div className={cx("assignee-avatar")}>NA</div>
//                                 <div className={cx("assignee-info")}>
//                                     <span className={cx("assignee-name")}>Nguyễn Văn A</span>
//                                     <span className={cx("assignee-role")}>Project Manager</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className={cx("sidebar-section")}>
//                             <h4>Hành động</h4>
//                             <div className={cx("action-buttons")}>
//                                 <button className={cx("button", "primary", "full-width")}>
//                                     <FontAwesomeIcon icon={faCheck} />
//                                     Hoàn tất hợp đồng
//                                 </button>
//                                 <button className={cx("button", "outline", "full-width")}>
//                                     <FontAwesomeIcon icon={faShare} />
//                                     Gửi xem xét
//                                 </button>
//                                 <button className={cx("button", "ghost", "full-width")}>
//                                     <FontAwesomeIcon icon={faTimes} />
//                                     Lưu nháp
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Collapsible Sidebar */}
//                 <div className={cx("form-sidebar", { collapsed: sidebarCollapsed })}>
//                     <button
//                         className={cx("sidebar-toggle")}
//                         onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                         title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
//                     >
//                         <FontAwesomeIcon icon={sidebarCollapsed ? faChevronLeft : faChevronRight} />
//                     </button>

//                     <div className={cx("sidebar-content")}>
//                         {!sidebarCollapsed && (
//                             <>
//                                 <ProgressSidebar />
//                                 <ContractSummary milestones={milestones} />
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StagePreview;
