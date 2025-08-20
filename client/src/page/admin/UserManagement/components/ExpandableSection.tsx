import type React from 'react';
import classNames from 'classnames/bind';
import styles from '../UserLogDetail.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTasks,
    faClipboardCheck,
    faUserTag,
    faHistory,
    faCheckCircle,
    faCheckDouble,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import type { Contract } from '~/types/contract/contract.types';
import { getContractRoleLabel } from '~/utils/contract.utils';

const cx = classNames.bind(styles);

interface ExpandableSectionProps {
    contract: Contract;
    isExpanded: boolean;
    onToggle: () => void;
    isCompleted?: boolean;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
    contract,
    isExpanded,
    onToggle,
    isCompleted = false,
}) => {
    return (
        <div className={cx('expandable-section', { expanded: isExpanded })}>
            <div className={cx('expandable-content')}>
                {isExpanded && (
                    <div className={cx('collapse-header')}>
                        <button
                            type="button"
                            className={cx('collapse-btn')}
                            onClick={onToggle}
                            aria-label="Ẩn chi tiết"
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                    </div>
                )}

                <div className={cx('user-activities')}>
                    <h5>
                        <FontAwesomeIcon icon={isCompleted ? faHistory : faTasks} />
                        {isCompleted ? ' Hoạt động đã thực hiện' : ' Hoạt động của bạn'}
                    </h5>
                    {contract.userActivities && contract.userActivities.length > 0 ? (
                        contract.userActivities.map((activity) => (
                            <div key={activity.id} className={cx('activity-item')}>
                                <div className={cx('activity-details')}>
                                    <span className={cx('activity-action')}>{activity.action}</span>
                                    <span className={cx('activity-description')}>{activity.description}</span>
                                </div>
                                <span className={cx('activity-time')}>{activity.timestamp}</span>
                            </div>
                        ))
                    ) : (
                        <p className={cx('no-activities')}>Chưa có hoạt động nào</p>
                    )}
                </div>

                <div className={cx('assigned-tasks')}>
                    <h5>
                        <FontAwesomeIcon icon={isCompleted ? faCheckDouble : faClipboardCheck} />
                        {isCompleted ? ' Nhiệm vụ đã hoàn thành' : ' Nhiệm vụ được giao'}
                    </h5>
                    {contract.assignedTasks && contract.assignedTasks.length > 0 ? (
                        <ul>
                            {contract.assignedTasks.map((task, index) => (
                                <li key={index} className={cx(isCompleted ? 'completed-task' : '')}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    {task}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={cx('no-tasks')}>Chưa có nhiệm vụ nào</p>
                    )}
                </div>

                {!isCompleted && (
                    <div className={cx('contract-role')}>
                        <h5>
                            <FontAwesomeIcon icon={faUserTag} /> Vai trò trong hợp đồng
                        </h5>
                        <div className={cx('role-info')}>
                            <span className={cx('role-badge', contract.role)}>
                                {getContractRoleLabel(contract.role)}
                            </span>
                            <p className={cx('role-description')}>
                                {contract.role === 'owner' &&
                                    'Bạn là chủ sở hữu hợp đồng này, có toàn quyền quản lý và chỉnh sửa.'}
                                {contract.role === 'editor' && 'Bạn có quyền chỉnh sửa nội dung và cập nhật hợp đồng.'}
                                {contract.role === 'reviewer' && 'Bạn có quyền xem xét và đánh giá hợp đồng.'}
                                {contract.role === 'viewer' && 'Bạn chỉ có quyền xem hợp đồng.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpandableSection;
