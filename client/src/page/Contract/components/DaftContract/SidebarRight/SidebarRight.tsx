import classNames from "classnames/bind";
import styles from "./SidebarRight.module.scss";
// import { useContractForm } from "~/hooks/useContractForm";
// import { useModalManager } from "~/hooks/useModalManager";
// import DatePicker from "../../../../../components/DateRangePicker/DatePicker/DatePicker";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faProjectDiagram, faBell, faChevronRight } from "@fortawesome/free-solid-svg-icons";

// // Import lại các section components để hiển thị trực tiếp
// import GeneralInfoSection from "./sections/GeneralInfoSection";
// import PartiesSection from "./sections/PartiesSection";
// import ContentSection from "./sections/ContentSection";
// import AttachmentsSection from "./sections/AttachmentSection";
// import SecuritySection from "./sections/NoteSection";

// // Chỉ import 2 modals cần thiết
// import MilestonesTasksModal from "./Modal/MilestonesTasksModal";
// import NotificationsModal from "./Modal/NotificationsModal";

const cx = classNames.bind(styles);

const SidebarRight = () => {
    // const {
    //     contractCode,
    //     contractName,
    //     setContractName,
    //     contractType,
    //     setContractType,
    //     currentUser,
    //     manager,
    //     setManager,
    //     showDatePicker,
    //     setShowDatePicker,
    //     projectDescription,
    //     setProjectDescription,
    //     contractValue,
    //     handleContractValueChange,
    //     startDate,
    //     endDate,
    //     paymentMethod,
    //     setPaymentMethod,
    //     paymentSchedule,
    //     setPaymentSchedule,
    //     acceptanceConditions,
    //     setAcceptanceConditions,
    //     partyA,
    //     setPartyA,
    //     partyB,
    //     setPartyB,
    //     deliverables,
    //     setDeliverables,
    //     attachedFiles,
    //     handleFileUpload,
    //     removeFile,
    //     milestones,
    //     tasks,
    //     notifications,
    //     addMilestone,
    //     updateMilestone,
    //     removeMilestone,
    //     addTask,
    //     updateTask,
    //     removeTask,
    //     markNotificationAsRead,
    //     getTasksForMilestone,
    //     version,
    //     setVersion,
    //     internalNotes,
    //     setInternalNotes,
    //     handleDateChange,
    //     expandedSections,
    //     toggleSection,
    // } = useContractForm();

    // const { openModal, closeModal, isModalOpen } = useModalManager();

    // const unreadNotifications = notifications.filter((n) => !n.isRead).length;
    // const pendingMilestones = milestones.filter((m) => m.status === "pending").length;
    // const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    // const overdueMilestones = milestones.filter((m) => {
    //     const now = new Date();
    //     return m.dueDate < now && m.status !== "completed";
    // }).length;
    // const overdueTasks = tasks.filter((t) => {
    //     const now = new Date();
    //     return t.dueDate < now && t.status !== "completed";
    // }).length;

    return (
        <h1>Right</h1>
        // <div className={cx("wrapper")}>
        //     {/* Header thông tin hợp đồng */}
        //     <div className={cx("sidebar-header")}>
        //         <h3>Quản lý hợp đồng</h3>
        //         <p>
        //             Mã hợp đồng: <strong>{contractCode}</strong>
        //         </p>
        //         <div className={cx("header-stats")}>
        //             <span className={cx("stat")}>📅 {milestones.length} mốc thời gian</span>
        //             <span className={cx("stat")}>✅ {tasks.length} công việc</span>
        //             <span className={cx("stat", { urgent: unreadNotifications > 0 })}>🔔 {unreadNotifications} thông báo mới</span>
        //         </div>
        //     </div>

        //     {/* Thông tin chung */}
        //     <GeneralInfoSection
        //         isExpanded={expandedSections.general}
        //         onToggle={() => toggleSection("general")}
        //         contractCode={contractCode}
        //         contractName={contractName}
        //         setContractName={setContractName}
        //         contractType={contractType}
        //         setContractType={setContractType}
        //         currentUser={currentUser}
        //         manager={manager}
        //         setManager={setManager}
        //     />

        //     {/* Thông tin các bên */}
        //     {/* <PartiesSection
        //         isExpanded={expandedSections.parties}
        //         onToggle={() => toggleSection("parties")}
        //         partyA={partyA}
        //         setPartyA={setPartyA}
        //         partyB={partyB}
        //         setPartyB={setPartyB}
        //     /> */}

        //     {/* Nội dung hợp đồng */}
        //     <ContentSection
        //         isExpanded={expandedSections.content}
        //         onToggle={() => toggleSection("content")}
        //         projectDescription={projectDescription}
        //         setProjectDescription={setProjectDescription}
        //         contractValue={contractValue}
        //         handleContractValueChange={handleContractValueChange}
        //         startDate={startDate}
        //         endDate={endDate}
        //         setShowDatePicker={setShowDatePicker}
        //         paymentMethod={paymentMethod}
        //         setPaymentMethod={setPaymentMethod}
        //         paymentSchedule={paymentSchedule}
        //         setPaymentSchedule={setPaymentSchedule}
        //         acceptanceConditions={acceptanceConditions}
        //         setAcceptanceConditions={setAcceptanceConditions}
        //         deliverables={deliverables}
        //         setDeliverables={setDeliverables}
        //     />

        //     {/* Tài liệu đính kèm */}
        //     <AttachmentsSection
        //         isExpanded={expandedSections.attachments}
        //         onToggle={() => toggleSection("attachments")}
        //         attachedFiles={attachedFiles}
        //         handleFileUpload={handleFileUpload}
        //         removeFile={removeFile}
        //     />

        //     {/* Menu items cho modal sections */}
        //     {/* <div className={cx("modal-menu-section")}>
        //         <h4>Quản lý tiến độ & Thông báo</h4>

        //         <div
        //             className={cx("menu-item", { urgent: overdueMilestones + overdueTasks > 0 })}
        //             onClick={() => openModal("milestones-tasks")}
        //         >
        //             <div className={cx("menu-icon")} style={{ backgroundColor: "#9b59b6" }}>
        //                 <FontAwesomeIcon icon={faProjectDiagram} />
        //             </div>
        //             <div className={cx("menu-content")}>
        //                 <div className={cx("menu-title")}>
        //                     <div className={cx("menu-title-label")}>Mốc thời gian & Công việc</div>
        //                     {pendingMilestones + pendingTasks > 0 && (
        //                         <span className={cx("menu-badge")} style={{ backgroundColor: "#9b59b6" }}>
        //                             {pendingMilestones + pendingTasks}
        //                         </span>
        //                     )}
        //                     {overdueMilestones + overdueTasks > 0 && <span className={cx("overdue-indicator")}>⚠️ Quá hạn</span>}
        //                 </div>
        //                 <div className={cx("menu-description")}>Quản lý các giai đoạn và công việc trong hợp đồng</div>
        //             </div>
        //             <div className={cx("menu-arrow")}>
        //                 <FontAwesomeIcon icon={faChevronRight} />
        //             </div>
        //         </div>

        //         <div className={cx("menu-item", { urgent: unreadNotifications > 5 })} onClick={() => openModal("notifications")}>
        //             <div className={cx("menu-icon")} style={{ backgroundColor: "#e74c3c" }}>
        //                 <FontAwesomeIcon icon={faBell} />
        //             </div>
        //             <div className={cx("menu-content")}>
        //                 <div className={cx("menu-title")}>
        //                     <div className={cx("menu-title-label")}>Thông báo</div>
        //                     {unreadNotifications > 0 && (
        //                         <span className={cx("menu-badge")} style={{ backgroundColor: "#e74c3c" }}>
        //                             {unreadNotifications}
        //                         </span>
        //                     )}
        //                 </div>
        //                 <div className={cx("menu-description")}>Nhắc nhở về mốc thời gian và công việc sắp đến hạn</div>
        //             </div>
        //             <div className={cx("menu-arrow")}>
        //                 <FontAwesomeIcon icon={faChevronRight} />
        //             </div>
        //         </div>
        //     </div> */}

        //     {/* Bảo mật & Lưu vết */}
        //     <SecuritySection
        //         isExpanded={expandedSections.security}
        //         onToggle={() => toggleSection("security")}
        //         version={version}
        //         setVersion={setVersion}
        //         internalNotes={internalNotes}
        //         setInternalNotes={setInternalNotes}
        //         currentUser={currentUser}
        //     />

        //     {/* Progress Overview */}
        //     {/* <div className={cx("progress-overview")}>
        //         <h4>Tổng quan tiến độ</h4>
        //         <div className={cx("progress-stats")}>
        //             <div className={cx("progress-item")}>
        //                 <div className={cx("progress-header")}>
        //                     <span className={cx("progress-label")}>Mốc thời gian</span>
        //                     <span className={cx("progress-value")}>
        //                         {milestones.filter((m) => m.status === "completed").length}/{milestones.length}
        //                     </span>
        //                 </div>
        //                 <div className={cx("progress-bar")}>
        //                     <div
        //                         className={cx("progress-fill", "milestone-progress")}
        //                         style={{
        //                             width:
        //                                 milestones.length > 0
        //                                     ? `${(milestones.filter((m) => m.status === "completed").length / milestones.length) * 100}%`
        //                                     : "0%",
        //                         }}
        //                     />
        //                 </div>
        //             </div>

        //             <div className={cx("progress-item")}>
        //                 <div className={cx("progress-header")}>
        //                     <span className={cx("progress-label")}>Công việc</span>
        //                     <span className={cx("progress-value")}>
        //                         {tasks.filter((t) => t.status === "completed").length}/{tasks.length}
        //                     </span>
        //                 </div>
        //                 <div className={cx("progress-bar")}>
        //                     <div
        //                         className={cx("progress-fill", "task-progress")}
        //                         style={{
        //                             width:
        //                                 tasks.length > 0
        //                                     ? `${(tasks.filter((t) => t.status === "completed").length / tasks.length) * 100}%`
        //                                     : "0%",
        //                         }}
        //                     />
        //                 </div>
        //             </div>
        //         </div>

        //         {(overdueMilestones > 0 || overdueTasks > 0) && (
        //             <div className={cx("urgent-alerts")}>
        //                 <h5>⚠️ Cần chú ý</h5>
        //                 {overdueMilestones > 0 && (
        //                     <div className={cx("alert-item")}>
        //                         <span>{overdueMilestones} mốc thời gian quá hạn</span>
        //                     </div>
        //                 )}
        //                 {overdueTasks > 0 && (
        //                     <div className={cx("alert-item")}>
        //                         <span>{overdueTasks} công việc quá hạn</span>
        //                     </div>
        //                 )}
        //             </div>
        //         )}
        //     </div> */}

        //     {/* Chỉ 2 modals */}
        //     {/* <MilestonesTasksModal
        //         isOpen={isModalOpen("milestones-tasks")}
        //         onClose={() => closeModal("milestones-tasks")}
        //         milestones={milestones}
        //         tasks={tasks}
        //         addMilestone={addMilestone}
        //         updateMilestone={updateMilestone}
        //         removeMilestone={removeMilestone}
        //         addTask={addTask}
        //         updateTask={updateTask}
        //         removeTask={removeTask}
        //         getTasksForMilestone={getTasksForMilestone}
        //         currentUser={currentUser}
        //     />

        //     <NotificationsModal
        //         isOpen={isModalOpen("notifications")}
        //         onClose={() => closeModal("notifications")}
        //         notifications={notifications}
        //         markNotificationAsRead={markNotificationAsRead}
        //     /> */}

        //     {showDatePicker && (
        //         <DatePicker
        //             startDate={startDate}
        //             endDate={endDate}
        //             onDateChange={handleDateChange}
        //             onClose={() => setShowDatePicker(false)}
        //         />
        //     )}
        // </div>
    );
};

export default SidebarRight;
