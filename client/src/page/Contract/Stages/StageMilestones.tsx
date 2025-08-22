import React, { useState, useEffect } from 'react';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { useContractStore } from '~/store/contract-store';
import type { Milestone, Task, MilestoneFormData } from '~/types/contract/contract.types';
import { Logger } from '~/core/Logger';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faCalendarAlt, 
    faUser, 
    faTasks,
    faBuilding,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './StageMilestones.module.scss';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

interface Department {
    id: string;
    name: string;
    code: string;
}

const StageMilestones: React.FC = () => {
    const { currentDraft, updateDraftData, validateCurrentStage } = useContractDraftStore();
    const { formData, setFormData } = useContractStore();
    
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [departments] = useState<Department[]>([
        { id: '1', name: 'Phòng Kinh doanh', code: 'SALES' },
        { id: '2', name: 'Phòng Kỹ thuật', code: 'TECH' },
        { id: '3', name: 'Phòng Nhân sự', code: 'HR' },
        { id: '4', name: 'Phòng Tài chính', code: 'FINANCE' },
        { id: '5', name: 'Phòng Pháp chế', code: 'LEGAL' },
    ]);
    
    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
        name: '',
        description: '',
        dateRange: { startDate: null, endDate: null },
        priority: 'medium',
        assignee: '',
        tasks: [],
        departmentCode: '',
        blockCode: '',
        meta: {}
    });

    useEffect(() => {
        if (currentDraft?.contractData.milestones) {
            setMilestones(currentDraft.contractData.milestones);
        }
    }, [currentDraft]);

    const handleAddMilestone = () => {
        setEditingMilestone(null);
        setMilestoneForm({
            name: '',
            description: '',
            dateRange: { startDate: null, endDate: null },
            priority: 'medium',
            assignee: '',
            tasks: [],
            departmentCode: '',
            blockCode: '',
            meta: {}
        });
        setShowMilestoneForm(true);
    };

    const handleEditMilestone = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setMilestoneForm({
            name: milestone.name,
            description: milestone.description || '',
            dateRange: milestone.dateRange,
            priority: milestone.priority,
            assignee: milestone.assignee,
            tasks: milestone.tasks,
            departmentCode: milestone.departmentCode || '',
            blockCode: milestone.blockCode || '',
            meta: milestone.meta || {}
        });
        setShowMilestoneForm(true);
    };

    const handleDeleteMilestone = (milestoneId: string) => {
        const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
        setMilestones(updatedMilestones);
        updateMilestones(updatedMilestones);
    };

    const handleSaveMilestone = () => {
        if (!milestoneForm.name.trim()) {
            alert('Vui lòng nhập tên mốc thời gian');
            return;
        }

        const newMilestone: Milestone = {
            id: editingMilestone?.id || `milestone-${Date.now()}`,
            ...milestoneForm
        };

        let updatedMilestones: Milestone[];
        if (editingMilestone) {
            updatedMilestones = milestones.map(m => 
                m.id === editingMilestone.id ? newMilestone : m
            );
        } else {
            updatedMilestones = [...milestones, newMilestone];
        }

        setMilestones(updatedMilestones);
        updateMilestones(updatedMilestones);
        setShowMilestoneForm(false);
        setEditingMilestone(null);
    };

    const updateMilestones = async (updatedMilestones: Milestone[]) => {
        try {
            if (currentDraft) {
                await updateDraftData('milestones_tasks', {
                    milestones: updatedMilestones
                });
            }
        } catch (error) {
            logger.error('Failed to update milestones:', error);
        }
    };

    const handleAddTask = (milestoneId: string) => {
        const milestone = milestones.find(m => m.id === milestoneId);
        if (!milestone) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            name: 'Công việc mới',
            description: '',
            assignee: '',
            timeRange: {
                startDate: null,
                endDate: null,
                estimatedHours: 0
            },
            completed: false
        };

        const updatedMilestones = milestones.map(m => 
            m.id === milestoneId 
                ? { ...m, tasks: [...m.tasks, newTask] }
                : m
        );

        setMilestones(updatedMilestones);
        updateMilestones(updatedMilestones);
    };

    const handleUpdateTask = (milestoneId: string, taskId: string, updates: Partial<Task>) => {
        const updatedMilestones = milestones.map(m => 
            m.id === milestoneId 
                ? {
                    ...m,
                    tasks: m.tasks.map(t => 
                        t.id === taskId ? { ...t, ...updates } : t
                    )
                }
                : m
        );

        setMilestones(updatedMilestones);
        updateMilestones(updatedMilestones);
    };

    const handleDeleteTask = (milestoneId: string, taskId: string) => {
        const updatedMilestones = milestones.map(m => 
            m.id === milestoneId 
                ? { ...m, tasks: m.tasks.filter(t => t.id !== taskId) }
                : m
        );

        setMilestones(updatedMilestones);
        updateMilestones(updatedMilestones);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#fd7e14';
            case 'critical': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getDepartmentName = (code: string) => {
        const dept = departments.find(d => d.code === code);
        return dept?.name || code;
    };

    return (
        <div className={cx('stage-milestones')}>
            <div className={cx('header')}>
                <h2>Thiết lập mốc thời gian và công việc</h2>
                <p>Quản lý các giai đoạn, mốc thời gian và phân công công việc cho hợp đồng</p>
            </div>

            <div className={cx('content')}>
                <div className={cx('milestones-section')}>
                    <div className={cx('section-header')}>
                        <h3>Mốc thời gian ({milestones.length})</h3>
                        <Button
                            type="button"
                            primary
                            onClick={handleAddMilestone}
                            leftIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Thêm mốc thời gian
                        </Button>
                    </div>

                    <div className={cx('milestones-grid')}>
                        {milestones.map((milestone) => (
                            <div key={milestone.id} className={cx('milestone-card')}>
                                <div className={cx('milestone-header')}>
                                    <div className={cx('milestone-info')}>
                                        <h4>{milestone.name}</h4>
                                        <div className={cx('milestone-meta')}>
                                            <span className={cx('priority')} style={{ color: getPriorityColor(milestone.priority) }}>
                                                {milestone.priority.toUpperCase()}
                                            </span>
                                            {milestone.departmentCode && (
                                                <span className={cx('department')}>
                                                    <FontAwesomeIcon icon={faBuilding} />
                                                    {getDepartmentName(milestone.departmentCode)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={cx('milestone-actions')}>
                                        <button
                                            type="button"
                                            onClick={() => handleEditMilestone(milestone)}
                                            className={cx('action-btn', 'edit')}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMilestone(milestone.id)}
                                            className={cx('action-btn', 'delete')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>

                                {milestone.description && (
                                    <p className={cx('milestone-description')}>{milestone.description}</p>
                                )}

                                <div className={cx('milestone-dates')}>
                                    <div className={cx('date-range')}>
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        <span>
                                            {milestone.dateRange.startDate} - {milestone.dateRange.endDate}
                                        </span>
                                    </div>
                                    <div className={cx('assignee')}>
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>{milestone.assignee}</span>
                                    </div>
                                </div>

                                <div className={cx('tasks-section')}>
                                    <div className={cx('tasks-header')}>
                                        <h5>
                                            <FontAwesomeIcon icon={faTasks} />
                                            Công việc ({milestone.tasks.length})
                                        </h5>
                                        <button
                                            type="button"
                                            onClick={() => handleAddTask(milestone.id)}
                                            className={cx('add-task-btn')}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>

                                    <div className={cx('tasks-list')}>
                                        {milestone.tasks.map((task) => (
                                            <div key={task.id} className={cx('task-item')}>
                                                <div className={cx('task-info')}>
                                                    <input
                                                        type="text"
                                                        value={task.name}
                                                        onChange={(e) => handleUpdateTask(milestone.id, task.id, { name: e.target.value })}
                                                        className={cx('task-name')}
                                                    />
                                                    <div className={cx('task-meta')}>
                                                        <span className={cx('assignee')}>
                                                            <FontAwesomeIcon icon={faUser} />
                                                            {task.assignee}
                                                        </span>
                                                        <span className={cx('time')}>
                                                            <FontAwesomeIcon icon={faClock} />
                                                            {task.timeRange.estimatedHours}h
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTask(milestone.id, task.id)}
                                                    className={cx('delete-task-btn')}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Milestone Form Modal */}
            {showMilestoneForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>{editingMilestone ? 'Chỉnh sửa mốc thời gian' : 'Thêm mốc thời gian mới'}</h3>
                            <button
                                type="button"
                                onClick={() => setShowMilestoneForm(false)}
                                className={cx('close-btn')}
                            >
                                ×
                            </button>
                        </div>

                        <div className={cx('modal-content')}>
                            <div className={cx('form-group')}>
                                <label>Tên mốc thời gian *</label>
                                <input
                                    type="text"
                                    value={milestoneForm.name}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                                    placeholder="Nhập tên mốc thời gian"
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Mô tả</label>
                                <textarea
                                    value={milestoneForm.description}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                                    placeholder="Mô tả chi tiết về mốc thời gian"
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={milestoneForm.dateRange.startDate || ''}
                                        onChange={(e) => setMilestoneForm({
                                            ...milestoneForm,
                                            dateRange: { ...milestoneForm.dateRange, startDate: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={milestoneForm.dateRange.endDate || ''}
                                        onChange={(e) => setMilestoneForm({
                                            ...milestoneForm,
                                            dateRange: { ...milestoneForm.dateRange, endDate: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Độ ưu tiên</label>
                                    <select
                                        value={milestoneForm.priority}
                                        onChange={(e) => setMilestoneForm({ ...milestoneForm, priority: e.target.value as any })}
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                        <option value="critical">Khẩn cấp</option>
                                    </select>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Phòng ban</label>
                                    <select
                                        value={milestoneForm.departmentCode}
                                        onChange={(e) => setMilestoneForm({ ...milestoneForm, departmentCode: e.target.value })}
                                    >
                                        <option value="">Chọn phòng ban</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.code}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Người phụ trách</label>
                                <input
                                    type="text"
                                    value={milestoneForm.assignee}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, assignee: e.target.value })}
                                    placeholder="Nhập tên người phụ trách"
                                />
                            </div>
                        </div>

                        <div className={cx('modal-actions')}>
                            <Button
                                type="button"
                                onClick={() => setShowMilestoneForm(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                primary
                                onClick={handleSaveMilestone}
                            >
                                {editingMilestone ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StageMilestones;