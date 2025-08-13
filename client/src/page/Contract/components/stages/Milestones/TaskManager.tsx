import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./TaskManager.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit, faClock, faUser, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Button from "~/components/Button";
import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import ControllerDropdown from "~/components/Form/ControllerValid/ControllerDropdown";
import type { Task } from "~/types/contract/contract.types";
import { calculateEstimatedHours, dateToISOString, isoStringToDate } from "~/utils/contract";

const cx = classNames.bind(styles);

interface TaskManagerProps {
    tasks: Task[];
    onTasksChange: (tasks: Task[]) => void;
    employees: Array<{ value: string; label: string }>;
}

interface TaskFormData {
    name: string;
    description: string;
    assignee: string;
    startDate: Date | null;
    endDate: Date | null;
    estimatedHours: number;
}

interface FormErrors {
    name?: string;
    assignee?: string;
    timeRange?: string;
    estimatedHours?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onTasksChange, employees }) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [formData, setFormData] = useState<TaskFormData>({
        name: "",
        description: "",
        assignee: "",
        startDate: null,
        endDate: null,
        estimatedHours: 0,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            assignee: "",
            startDate: null,
            endDate: null,
            estimatedHours: 0,
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập tên công việc";
        }

        if (!formData.assignee) {
            newErrors.assignee = "Vui lòng chọn người thực hiện";
        }

        // if (!formData.startDate || !formData.endDate) {
        //     newErrors.timeRange = "Vui lòng chọn thời gian bắt đầu và kết thúc";
        // } else if (formData.startDate >= formData.endDate) {
        //     newErrors.timeRange = "Thời gian kết thúc phải sau thời gian bắt đầu";
        // }

        if (formData.estimatedHours <= 0) {
            newErrors.estimatedHours = "Thời gian ước tính phải lớn hơn 0";
        }

        setErrors(newErrors);
        console.log(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof TaskFormData, value: string | number | Date | null) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };

            // Auto-calculate estimated hours when dates change
            if (field === "startDate" || field === "endDate") {
                if (newData.startDate && newData.endDate) {
                    newData.estimatedHours = calculateEstimatedHours(newData.startDate, newData.endDate);
                }
            }

            return newData;
        });

        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAddTask = () => {
        if (!validateForm()) return;
        console.log(123);

        // const { startDate, endDate } = formData;
        // if (!startDate || !endDate) return;

        const newTask: Task = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            assignee: employees.find((emp) => emp.value === formData.assignee)?.label || "",
            timeRange: {
                // startDate: dateToISOString(startDate),
                // endDate: dateToISOString(endDate),
                startDate: null,
                endDate: null,
                estimatedHours: formData.estimatedHours,
            },
            completed: false,
        };

        onTasksChange([...tasks, newTask]);
        resetForm();
        setShowTaskForm(false);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setFormData({
            name: task.name,
            description: task.description,
            assignee: employees.find((emp) => emp.label === task.assignee)?.value || "",
            startDate: isoStringToDate(task.timeRange.startDate),
            endDate: isoStringToDate(task.timeRange.endDate),
            estimatedHours: task.timeRange.estimatedHours,
        });
        setShowTaskForm(true);
    };

    const handleUpdateTask = () => {
        if (!validateForm() || !editingTask) return;

        const { startDate, endDate } = formData;

        const updatedTask: Task = {
            ...editingTask,
            name: formData.name,
            description: formData.description,
            assignee: employees.find((emp) => emp.value === formData.assignee)?.label || "",
            timeRange: {
                startDate: dateToISOString(startDate),
                endDate: dateToISOString(endDate),
                estimatedHours: formData.estimatedHours,
            },
        };

        onTasksChange(tasks.map((task) => (task.id === editingTask.id ? updatedTask : task)));
        setEditingTask(null);
        resetForm();
        setShowTaskForm(false);
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        resetForm();
        setShowTaskForm(false);
    };

    const handleDeleteTask = (taskId: string) => {
        onTasksChange(tasks.filter((task) => task.id !== taskId));
        setShowDeleteConfirm(null);
    };

    const handleToggleComplete = (taskId: string) => {
        onTasksChange(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
    };

    const openAddTaskForm = () => {
        setEditingTask(null);
        resetForm();
        setShowTaskForm(true);
    };

    return (
        <div className={cx("task-manager")}>
            <div className={cx("section-header")}>
                <h3 className={cx("section-title")}>Công việc trong mốc thời gian</h3>
                {!showTaskForm && (
                    <Button type="button" medium outline onClick={openAddTaskForm} leftIcon={<FontAwesomeIcon icon={faPlus} />}>
                        Thêm công việc
                    </Button>
                )}
            </div>

            {showTaskForm && (
                <div className={cx("task-form-wrapper")}>
                    <div className={cx("task-form")}>
                        <div className={cx("form-header")}>
                            <h4>{editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}</h4>
                            <div onClick={handleCancelEdit} className={cx("cancelled")}>
                                <FontAwesomeIcon icon={faTimes} /> Hủy
                            </div>
                        </div>

                        <Input
                            name="taskName"
                            label="Tên công việc"
                            placeholder="Nhập tên công việc"
                            value={formData.name}
                            onChange={(value) => handleInputChange("name", value)}
                            error={errors.name}
                        />

                        <TextArea
                            name="taskDescription"
                            label="Mô tả công việc"
                            placeholder="Mô tả chi tiết công việc"
                            rows={2}
                            value={formData.description}
                            onChange={(value) => handleInputChange("description", value)}
                        />

                        <div className={cx("grid-cols-2")}>
                            <ControllerDropdown
                                name="taskAssignee"
                                label="Người thực hiện"
                                options={employees}
                                placeholder="-- Chọn người thực hiện --"
                                value={formData.assignee}
                                onChange={(value) => handleInputChange("assignee", value)}
                                error={errors.assignee}
                            />

                            <Input
                                name="estimatedHours"
                                label="Thời gian ước tính (giờ)"
                                type="number"
                                placeholder="0"
                                min="0.1"
                                step="0.1"
                                value={formData.estimatedHours}
                                onChange={(value) => handleInputChange("estimatedHours", Number(value))}
                                error={errors.estimatedHours}
                            />
                        </div>

                        <div className={cx("form-actions")}>
                            {editingTask ? (
                                <>
                                    <Button
                                        type="button"
                                        medium
                                        primary
                                        onClick={handleUpdateTask}
                                        leftIcon={<FontAwesomeIcon icon={faSave} />}
                                    >
                                        Cập nhật công việc
                                    </Button>
                                    <Button
                                        type="button"
                                        medium
                                        outline
                                        onClick={handleCancelEdit}
                                        leftIcon={<FontAwesomeIcon icon={faTimes} />}
                                    >
                                        Hủy
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    fullWidth
                                    type="button"
                                    outline
                                    onClick={handleAddTask}
                                    leftIcon={<FontAwesomeIcon icon={faPlus} />}
                                >
                                    Thêm công việc
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {tasks.length > 0 && (
                <div className={cx("task-list")}>
                    <label className={cx("tasks-label")}>Danh sách công việc ({tasks.length}):</label>
                    {tasks.map((task) => (
                        <div key={task.id} className={cx("task-item", { completed: task.completed })}>
                            <div className={cx("task-info")}>
                                <div className={cx("task-header")}>
                                    <div className={cx("task-name")}>
                                        <span className={cx({ completed: task.completed })}>{task.name}</span>
                                    </div>
                                    <div className={cx("task-actions")}>
                                        <Button
                                            small
                                            primary
                                            rounded
                                            onClick={() => handleEditTask(task)}
                                            className={cx("button", "ghost", "small")}
                                            leftIcon={<FontAwesomeIcon icon={faEdit} className={cx("icon", "icon-small")} />}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <Button
                                            small
                                            outline
                                            rounded
                                            onClick={() => setShowDeleteConfirm(task.id)}
                                            className={cx("button", "ghost", "small", "danger")}
                                            leftIcon={<FontAwesomeIcon icon={faTrash} className={cx("icon", "icon-small")} />}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>

                                <div className={cx("task-meta")}>
                                    <FontAwesomeIcon icon={faUser} className={cx("icon", "icon-small")} />
                                    {task.assignee} •
                                    <FontAwesomeIcon icon={faClock} className={cx("icon", "icon-small")} />
                                    {task.timeRange.estimatedHours}h
                                </div>

                                {task.description && <div className={cx("task-description")}>Mô tả: {task.description}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteConfirm && (
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal")}>
                        <h3>Xác nhận xóa công việc</h3>
                        <p>Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.</p>
                        <div className={cx("modal-actions")}>
                            <Button primary small onClick={() => handleDeleteTask(showDeleteConfirm)}>
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
    );
};

export default TaskManager;
