import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./StageMilestones.module.scss";
import Form from "~/components/Form";
import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import type { SubmitHandler } from "react-hook-form";
import { ProgressSidebar } from "../../Sidebar/ProgressSidebar";
import { ContractSummary } from "../../Sidebar/ContractSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileContract,
    faChevronLeft,
    faChevronRight,
    faPlus,
    faEdit,
    faCheckCircle,
    faCalendar,
    faClock,
    faUser,
    faCircle,
} from "@fortawesome/free-solid-svg-icons";
import ControlledDateRangeField from "~/components/Form/ControllerValid/ControllerDatePicker";
import ControlledDropdownField from "~/components/Form/ControllerValid/ControllerDropdown";
import TaskManager from "./TaskManager";
import Button from "~/components/Button";
import type { MilestoneFormData, Milestone, Task } from "~/types/contract/contract.types";
// import { useContractForm } from "~/hooks/useContractForm";
import Badge from "~/components/Badge";
import { convertDateRange, convertTimeRange, formatDateForDisplay, validateDateRange } from "~/utils/contract";
import { useNavigate } from "react-router-dom";
import { useContractStore } from "~/store/contract-store";

const cx = classNames.bind(styles);

const StageMilestones: React.FC = () => {
    const [milestones, setMilestonesState] = useState<Milestone[]>([]);
    const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const { currentStep, goToStep } = useContractStore();
    const { setMilestones, validateStep, nextStep } = useContractForm();
    const navigate = useNavigate();

    const employees = [
        { value: "nguyen-van-a", label: "Nguyễn Văn A" },
        { value: "tran-thi-b", label: "Trần Thị B" },
        { value: "le-van-c", label: "Lê Văn C" },
        { value: "pham-thi-d", label: "Phạm Thị D" },
    ];

    const priorityOptions = [
        { value: "low", label: "Thấp" },
        { value: "medium", label: "Trung bình" },
        { value: "high", label: "Cao" },
        { value: "critical", label: "Khẩn cấp" },
    ];

    const milestoneDefaultValues: MilestoneFormData = {
        name: "",
        description: "",
        dateRange: { startDate: null, endDate: null },
        priority: "medium",
        assignee: "",
        tasks: [],
    };

    const handleEditMilestone = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setCurrentTasks([...milestone.tasks]);
    };

    const handleUpdateMilestone: SubmitHandler<MilestoneFormData> = (data) => {
        if (!editingMilestone) return;

        // Validate date range
        const dateRangeError = validateDateRange(data.dateRange);
        if (dateRangeError) {
            alert(dateRangeError);
            return;
        }

        const updatedMilestone: Milestone = {
            ...editingMilestone,
            name: data.name,
            description: data.description,
            dateRange: convertDateRange(data.dateRange),
            priority: data.priority,
            assignee: employees.find((emp) => emp.value === data.assignee)?.label || "",
            tasks: currentTasks.map((task) => ({
                ...task,
                timeRange: convertTimeRange(task.timeRange),
            })),
        };

        const updatedMilestones = milestones.map((m) => (m.id === editingMilestone.id ? updatedMilestone : m));

        setMilestones(updatedMilestones);
        setMilestonesState(updatedMilestones);
        setEditingMilestone(null);
        setCurrentTasks([]);
    };

    const handleDeleteMilestone = (milestoneId: string) => {
        const updated = milestones.filter((m) => m.id !== milestoneId);
        setMilestonesState(updated);
        setMilestones(updated);
        setShowDeleteConfirm(null);
    };

    const handleCancelEdit = () => {
        setEditingMilestone(null);
        setCurrentTasks([]);
    };

    const handleCreateMilestone: SubmitHandler<MilestoneFormData> = (data) => {
        // Validate date range
        const dateRangeError = validateDateRange(data.dateRange);
        if (dateRangeError) {
            alert(dateRangeError);
            return;
        }

        const newMilestone: Milestone = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description,
            dateRange: convertDateRange(data.dateRange),
            priority: data.priority,
            assignee: employees.find((emp) => emp.value === data.assignee)?.label || "",
            tasks: currentTasks.map((task) => ({
                ...task,
                timeRange: convertTimeRange(task.timeRange),
            })),
        };

        const updatedMilestones = [...milestones, newMilestone];
        setMilestonesState(updatedMilestones);
        // setMilestones(updatedMilestones);
        setCurrentTasks([]);
    };

    const handleFormSubmit = () => {
        console.log("Form submitted with milestones:", milestones);

        if (milestones.length === 0) {
            alert("Vui lòng tạo ít nhất một mốc thời gian");
            return;
        }

        setMilestones(milestones);

        if (validateStep(2)) {
            console.log("Step 2 validation passed, moving to step 3");
            nextStep();
            navigate("/page/create/daft?stage=3");
        } else {
            console.log("Step 2 validation failed");
        }
    };

    const getPriorityClass = (priority: string) => cx("badge", `priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`);

    type Priority = "low" | "medium" | "high" | "critical";

    const getPriorityText = (priority: Priority) => {
        const map: Record<Priority, string> = {
            low: "Thấp",
            medium: "Trung bình",
            high: "Cao",
            critical: "Khẩn cấp",
        };
        return map[priority];
    };

    return (
        <div className={cx("container")}>
            <div className={cx("wrapper")}>
                <div className={cx("form-header")}>
                    <h2>
                        <FontAwesomeIcon icon={faFileContract} /> Tạo hợp đồng mới - Giai đoạn 2
                    </h2>
                    <p>Tạo các mốc thời gian và công việc cho hợp đồng</p>
                </div>

                <div className={cx("mainGrid", { sidebarCollapsed })}>
                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <h2>
                                <FontAwesomeIcon icon={faPlus} className={cx("icon", "iconLarge")} />{" "}
                                {editingMilestone ? "Chỉnh sửa Mốc thời gian" : "Tạo Mốc thời gian mới"}
                            </h2>
                            {editingMilestone && (
                                <Button outline small text onClick={handleCancelEdit}>
                                    Hủy chỉnh sửa
                                </Button>
                            )}
                        </div>

                        <div className={cx("cardContent")}>
                            <Form<MilestoneFormData>
                                key={editingMilestone?.id || "new"}
                                defaultValues={
                                    editingMilestone
                                        ? {
                                              name: editingMilestone.name,
                                              description: editingMilestone.description,
                                              dateRange: editingMilestone.dateRange,
                                              priority: editingMilestone.priority,
                                              assignee: employees.find((emp) => emp.label === editingMilestone.assignee)?.value || "",
                                          }
                                        : milestoneDefaultValues
                                }
                                onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}
                                className={cx("milestoneForm")}
                            >
                                <Input
                                    name="name"
                                    label="Tên mốc thời gian"
                                    placeholder="Nhập tên mốc thời gian"
                                    required="Vui lòng nhập tên mốc thời gian"
                                />

                                <TextArea name="description" label="Mô tả" placeholder="Mô tả chi tiết về mốc thời gian" rows={3} />

                                <ControlledDateRangeField
                                    name="dateRange"
                                    label="Thời gian thực hiện"
                                    placeholder="Chọn ngày bắt đầu và kết thúc"
                                    requiredMessage="Vui lòng chọn đầy đủ thời gian thực hiện"
                                />

                                <div className={cx("gridCols2")}>
                                    <ControlledDropdownField
                                        name="priority"
                                        label="Mức độ ưu tiên"
                                        options={priorityOptions}
                                        placeholder="Chọn mức độ ưu tiên"
                                        requiredMessage="Vui lòng chọn mức độ ưu tiên"
                                    />

                                    <ControlledDropdownField
                                        name="assignee"
                                        label="Người phụ trách"
                                        options={employees}
                                        placeholder="Chọn người phụ trách"
                                        requiredMessage="Vui lòng chọn người phụ trách"
                                    />
                                </div>

                                <div className={cx("separator")} />

                                <TaskManager tasks={currentTasks} onTasksChange={setCurrentTasks} employees={employees} />

                                <div className={cx("form-actions")}>
                                    <Button type="submit" primary medium fullWidth>
                                        {editingMilestone ? "Cập nhật mốc thời gian" : "Tạo mốc thời gian"}
                                    </Button>

                                    {editingMilestone && (
                                        <Button type="button" outline medium onClick={handleCancelEdit}>
                                            Hủy
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </div>
                    </div>

                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <h2>
                                <FontAwesomeIcon icon={faCheckCircle} className={cx("icon", "iconLarge")} />
                                Xem trước Timeline
                            </h2>
                        </div>

                        <div className={cx("cardContent")}>
                            {milestones.length === 0 ? (
                                <div className={cx("emptyState")}>
                                    <FontAwesomeIcon icon={faCalendar} className={cx("emptyIcon")} />
                                    <p>Chưa có mốc thời gian nào được tạo</p>
                                    <p>Tạo mốc thời gian đầu tiên để xem preview</p>
                                </div>
                            ) : (
                                <div className={cx("timeline")}>
                                    {milestones.map((milestone, index) => (
                                        <div key={milestone.id} className={cx("timelineItem")}>
                                            {index < milestones.length - 1 && <div className={cx("timelineConnector")} />}
                                            <div className={cx("timelineContent")}>
                                                <div className={cx("timelineNumber")}>{index + 1}</div>
                                                <div className={cx("timelineCard")}>
                                                    <div className={cx("timelineHeader")}>
                                                        <div className={cx("timelineTitle")}>
                                                            <h3>{milestone.name}</h3>
                                                            <p>{milestone.description}</p>
                                                        </div>
                                                        <div className={cx("timelineBadges")}>
                                                            <Badge
                                                                size="sm"
                                                                variant="outline"
                                                                className={getPriorityClass(milestone.priority)}
                                                            >
                                                                {getPriorityText(milestone.priority)}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className={cx("timelineMeta")}>
                                                        <div className={cx("metaLine")}>
                                                            <span className={cx("grayText")}>Thời gian hoạt động</span>
                                                            <span className={cx("separator-ic")}>
                                                                <FontAwesomeIcon icon={faCircle} />
                                                            </span>
                                                            <span className={cx("greenText")}>
                                                                {formatDateForDisplay(milestone.dateRange.startDate)}
                                                                <span> - </span>
                                                                {formatDateForDisplay(milestone.dateRange.endDate)}
                                                            </span>
                                                        </div>

                                                        <div className={cx("metaLine")}>
                                                            <span className={cx("grayText")}>Người phụ trách</span>
                                                            <span className={cx("separator-ic")}>
                                                                <FontAwesomeIcon icon={faCircle} />
                                                            </span>
                                                            <span className={cx("greenText")}>{milestone.assignee}</span>
                                                        </div>
                                                    </div>

                                                    {milestone.tasks.length > 0 && (
                                                        <div className={cx("timelineTasks")}>
                                                            <span className={cx("tasksLabel")}>Công việc ({milestone.tasks.length}):</span>
                                                            {milestone.tasks.map((task) => (
                                                                <div key={task.id} className={cx("timelineTask")}>
                                                                    <div className={cx("taskHeader")}>
                                                                        <div className={cx("taskTitle")}>{task.name}</div>
                                                                        <div className={cx("taskTime")}>
                                                                            <FontAwesomeIcon
                                                                                icon={faClock}
                                                                                className={cx("icon", "iconSmall")}
                                                                            />
                                                                            {task.timeRange.estimatedHours}h
                                                                        </div>
                                                                    </div>

                                                                    {task.description && (
                                                                        <p className={cx("taskDescription")}>{task.description}</p>
                                                                    )}

                                                                    <div className={cx("taskAssignee")}>
                                                                        <FontAwesomeIcon
                                                                            icon={faUser}
                                                                            className={cx("icon", "iconSmall")}
                                                                        />
                                                                        {task.assignee}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className={cx("timelineActions")}>
                                                        <Button
                                                            small
                                                            rounded
                                                            primary
                                                            bolder
                                                            onClick={() => handleEditMilestone(milestone)}
                                                            leftIcon={<FontAwesomeIcon icon={faEdit} />}
                                                        >
                                                            Chỉnh sửa
                                                        </Button>

                                                        <Button
                                                            small
                                                            rounded
                                                            outline
                                                            bolder
                                                            className={cx("cancelled-btn")}
                                                            onClick={() => setShowDeleteConfirm(milestone.id)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={cx("footerBar")}>
                    <div className={cx("footerActions")}>
                        <Button
                            outline
                            medium
                            onClick={() => {
                                if (currentStep > 1) goToStep(currentStep - 1);
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
                        </Button>

                        <Button primary medium onClick={handleFormSubmit}>
                            <FontAwesomeIcon icon={faFileContract} />
                            Lưu và tiếp tục đến giai đoạn 3
                        </Button>
                    </div>
                </div>

                <div className={cx("form-sidebar", { collapsed: sidebarCollapsed })}>
                    <button
                        className={cx("sidebar-toggle")}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    >
                        <FontAwesomeIcon icon={sidebarCollapsed ? faChevronLeft : faChevronRight} />
                    </button>

                    <div className={cx("sidebar-content")}>
                        {!sidebarCollapsed && (
                            <>
                                <ProgressSidebar />
                                <ContractSummary />
                            </>
                        )}
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div className={cx("modal-overlay")}>
                        <div className={cx("modal")}>
                            <h3>Xác nhận xóa</h3>
                            <p>Bạn có chắc chắn muốn xóa mốc thời gian này? Hành động này không thể hoàn tác.</p>
                            <div className={cx("modal-actions")}>
                                <Button primary small onClick={() => handleDeleteMilestone(showDeleteConfirm)}>
                                    Xóa
                                </Button>
                                <Button outline small onClick={() => setShowDeleteConfirm(null)}>
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StageMilestones;
