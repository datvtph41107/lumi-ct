import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faCalendarAlt, 
    faUser, 
    faClock,
    faBell,
    faCheckCircle,
    faExclamationTriangle,
    faArrowRight,
    faSave,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { contractService } from '~/services/api/contract.service';
import { useContractDraftStore } from '~/store/contract-draft-store';
import type { 
    ContractMilestone, 
    ContractTask,
    DateRange,
    TimeRange,
    Priority 
} from '~/types/contract/contract.types';
import styles from './StageMilestones.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface StageMilestonesProps {
    contractId: string;
    currentUserId: number;
}

interface MilestoneFormData {
    name: string;
    description: string;
    dateRange: DateRange;
    assigneeId: string;
    assigneeName: string;
    priority: Priority;
    deliverables: string[];
}

interface TaskFormData {
    name: string;
    description: string;
    assigneeId: string;
    assigneeName: string;
    timeRange: TimeRange;
    dueDate: string;
    priority: Priority;
    dependencies: string[];
}

const StageMilestones: React.FC<StageMilestonesProps> = ({ 
    contractId, 
    currentUserId 
}) => {
    const { currentDraft, updateDraftData, nextStage } = useContractDraftStore();
    
    const [milestones, setMilestones] = useState<ContractMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form states
    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<ContractMilestone | null>(null);
    const [editingTask, setEditingTask] = useState<ContractTask | null>(null);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    
    // Form data
    const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
        name: '',
        description: '',
        dateRange: { startDate: null, endDate: null },
        assigneeId: '',
        assigneeName: '',
        priority: 'medium',
        deliverables: [],
    });
    
    const [taskForm, setTaskForm] = useState<TaskFormData>({
        name: '',
        description: '',
        assigneeId: '',
        assigneeName: '',
        timeRange: { estimatedHours: 0 },
        dueDate: '',
        priority: 'medium',
        dependencies: [],
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        milestoneDueReminder: true,
        milestoneOverdueReminder: true,
        taskDueReminder: true,
        taskOverdueReminder: true,
        emailNotifications: true,
        inAppNotifications: true,
        advanceDays: 1,
    });

    useEffect(() => {
        loadMilestones();
    }, [contractId]);

    const loadMilestones = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await contractService.listMilestones(contractId);
            setMilestones(response.data || []);
            
            // Update draft data
            if (currentDraft) {
                updateDraftData('milestones_tasks', { milestones: response.data || [] });
            }
        } catch (err) {
            setError('Không thể tải danh sách milestones');
            console.error('Error loading milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await contractService.createMilestone(contractId, {
                name: milestoneForm.name,
                description: milestoneForm.description,
                date_range: milestoneForm.dateRange,
                assignee_id: milestoneForm.assigneeId,
                assignee_name: milestoneForm.assigneeName,
                priority: milestoneForm.priority,
                deliverables: milestoneForm.deliverables,
            });

            setMilestones(prev => [...prev, response.data]);
            setShowMilestoneForm(false);
            resetMilestoneForm();
            await loadMilestones();
        } catch (err) {
            setError('Không thể tạo milestone');
            console.error('Error creating milestone:', err);
        }
    };

    const handleUpdateMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMilestone) return;

        try {
            const response = await contractService.updateMilestone(editingMilestone.id, {
                name: milestoneForm.name,
                description: milestoneForm.description,
                date_range: milestoneForm.dateRange,
                assignee_id: milestoneForm.assigneeId,
                assignee_name: milestoneForm.assigneeName,
                priority: milestoneForm.priority,
                deliverables: milestoneForm.deliverables,
            });

            setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? response.data : m));
            setEditingMilestone(null);
            setShowMilestoneForm(false);
            resetMilestoneForm();
            await loadMilestones();
        } catch (err) {
            setError('Không thể cập nhật milestone');
            console.error('Error updating milestone:', err);
        }
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa milestone này?')) {
            return;
        }

        try {
            await contractService.deleteMilestone(milestoneId);
            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
            await loadMilestones();
        } catch (err) {
            setError('Không thể xóa milestone');
            console.error('Error deleting milestone:', err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMilestoneId) return;

        try {
            const response = await contractService.createTask(selectedMilestoneId, {
                name: taskForm.name,
                description: taskForm.description,
                assignee_id: taskForm.assigneeId,
                assignee_name: taskForm.assigneeName,
                time_range: taskForm.timeRange,
                due_date: taskForm.dueDate,
                priority: taskForm.priority,
                dependencies: taskForm.dependencies,
            });

            setMilestones(prev => prev.map(m => {
                if (m.id === selectedMilestoneId) {
                    return { ...m, tasks: [...m.tasks, response.data] };
                }
                return m;
            }));

            setShowTaskForm(false);
            resetTaskForm();
            await loadMilestones();
        } catch (err) {
            setError('Không thể tạo task');
            console.error('Error creating task:', err);
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        try {
            const response = await contractService.updateTask(editingTask.id, {
                name: taskForm.name,
                description: taskForm.description,
                assignee_id: taskForm.assigneeId,
                assignee_name: taskForm.assigneeName,
                time_range: taskForm.timeRange,
                due_date: taskForm.dueDate,
                priority: taskForm.priority,
                dependencies: taskForm.dependencies,
            });

            setMilestones(prev => prev.map(m => ({
                ...m,
                tasks: m.tasks.map(t => t.id === editingTask.id ? response.data : t)
            })));

            setEditingTask(null);
            setShowTaskForm(false);
            resetTaskForm();
            await loadMilestones();
        } catch (err) {
            setError('Không thể cập nhật task');
            console.error('Error updating task:', err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa task này?')) {
            return;
        }

        try {
            await contractService.deleteTask(taskId);
            setMilestones(prev => prev.map(m => ({
                ...m,
                tasks: m.tasks.filter(t => t.id !== taskId)
            })));
            await loadMilestones();
        } catch (err) {
            setError('Không thể xóa task');
            console.error('Error deleting task:', err);
        }
    };

    const handleEditMilestone = (milestone: ContractMilestone) => {
        setEditingMilestone(milestone);
        setMilestoneForm({
            name: milestone.name,
            description: milestone.description || '',
            dateRange: milestone.dateRange,
            assigneeId: milestone.assigneeId,
            assigneeName: milestone.assigneeName,
            priority: milestone.priority,
            deliverables: milestone.deliverables || [],
        });
        setShowMilestoneForm(true);
    };

    const handleEditTask = (task: ContractTask) => {
        setEditingTask(task);
        setTaskForm({
            name: task.name,
            description: task.description || '',
            assigneeId: task.assigneeId,
            assigneeName: task.assigneeName,
            timeRange: task.timeRange,
            dueDate: task.dueDate || '',
            priority: task.priority,
            dependencies: task.dependencies || [],
        });
        setShowTaskForm(true);
    };

    const resetMilestoneForm = () => {
        setMilestoneForm({
            name: '',
            description: '',
            dateRange: { startDate: null, endDate: null },
            assigneeId: '',
            assigneeName: '',
            priority: 'medium',
            deliverables: [],
        });
    };

    const resetTaskForm = () => {
        setTaskForm({
            name: '',
            description: '',
            assigneeId: '',
            assigneeName: '',
            timeRange: { estimatedHours: 0 },
            dueDate: '',
            priority: 'medium',
            dependencies: [],
        });
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return faCheckCircle;
            case 'in_progress': return faClock;
            case 'overdue': return faExclamationTriangle;
            default: return faClock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#28a745';
            case 'in_progress': return '#007bff';
            case 'overdue': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const handleNextStage = async () => {
        try {
            // Save current stage data
            if (currentDraft) {
                await updateDraftData('milestones_tasks', { 
                    milestones,
                    notificationSettings 
                });
            }
            
            // Proceed to next stage
            await nextStage();
        } catch (err) {
            setError('Không thể chuyển sang giai đoạn tiếp theo');
            console.error('Error proceeding to next stage:', err);
        }
    };

    if (loading) {
        return (
            <div className={cx('loading')}>
                <FontAwesomeIcon icon={faClock} spin />
                <span>Đang tải milestones...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('error')}>
                <span>{error}</span>
                <button onClick={loadMilestones} className={cx('retry-btn')}>
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={cx('stage-milestones')}>
            {/* Header */}
            <div className={cx('header')}>
                <h2>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Quản lý mốc thời gian và công việc
                </h2>
                <div className={cx('header-actions')}>
                    <button 
                        className={cx('add-milestone-btn')}
                        onClick={() => {
                            setEditingMilestone(null);
                            resetMilestoneForm();
                            setShowMilestoneForm(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm mốc thời gian
                    </button>
                    <button 
                        className={cx('next-stage-btn')}
                        onClick={handleNextStage}
                        disabled={milestones.length === 0}
                    >
                        Tiếp tục
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </div>

            {/* Milestones List */}
            <div className={cx('milestones-container')}>
                {milestones.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <p>Chưa có mốc thời gian nào được tạo</p>
                        <button 
                            className={cx('add-first-milestone-btn')}
                            onClick={() => {
                                setEditingMilestone(null);
                                resetMilestoneForm();
                                setShowMilestoneForm(true);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Tạo mốc thời gian đầu tiên
                        </button>
                    </div>
                ) : (
                    milestones.map((milestone) => (
                        <div key={milestone.id} className={cx('milestone-card')}>
                            <div className={cx('milestone-header')}>
                                <div className={cx('milestone-info')}>
                                    <h3 className={cx('milestone-name')}>{milestone.name}</h3>
                                    <div className={cx('milestone-meta')}>
                                        <span className={cx('assignee')}>
                                            <FontAwesomeIcon icon={faUser} />
                                            {milestone.assigneeName}
                                        </span>
                                        <span 
                                            className={cx('priority')}
                                            style={{ color: getPriorityColor(milestone.priority) }}
                                        >
                                            {milestone.priority}
                                        </span>
                                        <span className={cx('date-range')}>
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                            {milestone.dateRange.startDate && milestone.dateRange.endDate && (
                                                `${new Date(milestone.dateRange.startDate).toLocaleDateString()} - ${new Date(milestone.dateRange.endDate).toLocaleDateString()}`
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={cx('milestone-actions')}>
                                    <button
                                        className={cx('action-btn', 'add-task')}
                                        onClick={() => {
                                            setSelectedMilestoneId(milestone.id);
                                            resetTaskForm();
                                            setShowTaskForm(true);
                                        }}
                                        title="Thêm task"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button
                                        className={cx('action-btn', 'edit')}
                                        onClick={() => handleEditMilestone(milestone)}
                                        title="Chỉnh sửa"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        className={cx('action-btn', 'delete')}
                                        onClick={() => handleDeleteMilestone(milestone.id)}
                                        title="Xóa"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>

                            {milestone.description && (
                                <p className={cx('milestone-description')}>{milestone.description}</p>
                            )}

                            {/* Tasks List */}
                            <div className={cx('tasks-container')}>
                                <h4>Danh sách công việc ({milestone.tasks.length})</h4>
                                {milestone.tasks.length === 0 ? (
                                    <p className={cx('no-tasks')}>Chưa có công việc nào</p>
                                ) : (
                                    <div className={cx('tasks-list')}>
                                        {milestone.tasks.map((task) => (
                                            <div key={task.id} className={cx('task-item')}>
                                                <div className={cx('task-info')}>
                                                    <div className={cx('task-header')}>
                                                        <h5 className={cx('task-name')}>{task.name}</h5>
                                                        <div className={cx('task-meta')}>
                                                            <span className={cx('assignee')}>
                                                                <FontAwesomeIcon icon={faUser} />
                                                                {task.assigneeName}
                                                            </span>
                                                            <span 
                                                                className={cx('priority')}
                                                                style={{ color: getPriorityColor(task.priority) }}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className={cx('due-date')}>
                                                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {task.description && (
                                                        <p className={cx('task-description')}>{task.description}</p>
                                                    )}
                                                </div>
                                                <div className={cx('task-actions')}>
                                                    <button
                                                        className={cx('action-btn', 'edit')}
                                                        onClick={() => handleEditTask(task)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className={cx('action-btn', 'delete')}
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        title="Xóa"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Notification Settings */}
            <div className={cx('notification-settings')}>
                <h3>
                    <FontAwesomeIcon icon={faBell} />
                    Cài đặt thông báo
                </h3>
                <div className={cx('settings-grid')}>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.milestoneDueReminder}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    milestoneDueReminder: e.target.checked
                                }))}
                            />
                            Nhắc nhở mốc thời gian sắp đến hạn
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.milestoneOverdueReminder}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    milestoneOverdueReminder: e.target.checked
                                }))}
                            />
                            Nhắc nhở mốc thời gian quá hạn
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.taskDueReminder}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    taskDueReminder: e.target.checked
                                }))}
                            />
                            Nhắc nhở công việc sắp đến hạn
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.taskOverdueReminder}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    taskOverdueReminder: e.target.checked
                                }))}
                            />
                            Nhắc nhở công việc quá hạn
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.emailNotifications}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    emailNotifications: e.target.checked
                                }))}
                            />
                            Thông báo qua email
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            <input
                                type="checkbox"
                                checked={notificationSettings.inAppNotifications}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    inAppNotifications: e.target.checked
                                }))}
                            />
                            Thông báo trong ứng dụng
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <label>
                            Nhắc nhở trước:
                            <select
                                value={notificationSettings.advanceDays}
                                onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    advanceDays: parseInt(e.target.value)
                                }))}
                            >
                                <option value={1}>1 ngày</option>
                                <option value={3}>3 ngày</option>
                                <option value={7}>1 tuần</option>
                                <option value={14}>2 tuần</option>
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            {/* Milestone Form Modal */}
            {showMilestoneForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h4>{editingMilestone ? 'Chỉnh sửa mốc thời gian' : 'Thêm mốc thời gian mới'}</h4>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setShowMilestoneForm(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        <form onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone} className={cx('modal-form')}>
                            <div className={cx('form-group')}>
                                <label>Tên mốc thời gian *</label>
                                <input
                                    type="text"
                                    value={milestoneForm.name}
                                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Mô tả</label>
                                <textarea
                                    value={milestoneForm.description}
                                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={milestoneForm.dateRange.startDate || ''}
                                        onChange={(e) => setMilestoneForm(prev => ({ 
                                            ...prev, 
                                            dateRange: { ...prev.dateRange, startDate: e.target.value }
                                        }))}
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={milestoneForm.dateRange.endDate || ''}
                                        onChange={(e) => setMilestoneForm(prev => ({ 
                                            ...prev, 
                                            dateRange: { ...prev.dateRange, endDate: e.target.value }
                                        }))}
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Người phụ trách</label>
                                    <input
                                        type="text"
                                        value={milestoneForm.assigneeName}
                                        onChange={(e) => setMilestoneForm(prev => ({ 
                                            ...prev, 
                                            assigneeName: e.target.value,
                                            assigneeId: e.target.value // Simplified for demo
                                        }))}
                                        placeholder="Tên người phụ trách"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Mức độ ưu tiên</label>
                                    <select
                                        value={milestoneForm.priority}
                                        onChange={(e) => setMilestoneForm(prev => ({ 
                                            ...prev, 
                                            priority: e.target.value as Priority 
                                        }))}
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setShowMilestoneForm(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('primary')}>
                                    <FontAwesomeIcon icon={editingMilestone ? faEdit : faPlus} />
                                    {editingMilestone ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Form Modal */}
            {showTaskForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h4>{editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h4>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setShowTaskForm(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className={cx('modal-form')}>
                            <div className={cx('form-group')}>
                                <label>Tên công việc *</label>
                                <input
                                    type="text"
                                    value={taskForm.name}
                                    onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Mô tả</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Người phụ trách</label>
                                    <input
                                        type="text"
                                        value={taskForm.assigneeName}
                                        onChange={(e) => setTaskForm(prev => ({ 
                                            ...prev, 
                                            assigneeName: e.target.value,
                                            assigneeId: e.target.value // Simplified for demo
                                        }))}
                                        placeholder="Tên người phụ trách"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Ngày đến hạn</label>
                                    <input
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Giờ ước tính</label>
                                    <input
                                        type="number"
                                        value={taskForm.timeRange.estimatedHours}
                                        onChange={(e) => setTaskForm(prev => ({ 
                                            ...prev, 
                                            timeRange: { ...prev.timeRange, estimatedHours: parseInt(e.target.value) || 0 }
                                        }))}
                                        min="0"
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Mức độ ưu tiên</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm(prev => ({ 
                                            ...prev, 
                                            priority: e.target.value as Priority 
                                        }))}
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setShowTaskForm(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('primary')}>
                                    <FontAwesomeIcon icon={editingTask ? faEdit : faPlus} />
                                    {editingTask ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StageMilestones;