import type React from 'react';
import classNames from 'classnames/bind';
import styles from '../UserLogDetail.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faCheck, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import type { Contract } from '~/types/contract/contract.types';
import { getContractStatusLabel, getContractRoleLabel } from '~/utils/contract.utils';
import Avatar from './Avatar';
import ExpandableSection from './ExpandableSection';

const cx = classNames.bind(styles);

interface ContractCardProps {
    contract: Contract;
    isExpanded: boolean;
    onToggleExpansion: () => void;
    isCompleted?: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({
    contract,
    isExpanded,
    onToggleExpansion,
    isCompleted = false,
}) => {
    return (
        <div className={cx('contract-card', isCompleted ? 'completed' : 'active', contract.mode)}>
            <div className={cx('card-top')}>
                <div className={cx('card-header')}>
                    <div className={cx('contract-tags')}>
                        <span className={cx('tag', 'role')}>{getContractRoleLabel(contract.role)}</span>
                        <span className={cx('tag', 'status', isCompleted ? 'completed' : '')}>
                            {getContractStatusLabel(contract.status)}
                        </span>
                        <span className={cx('tag', 'mode')}>{contract.mode === 'editor' ? 'Editor' : 'Form'}</span>
                    </div>
                    <div className={cx('card-menu')}>
                        <FontAwesomeIcon icon={faEllipsisH} />
                    </div>
                </div>

                {contract.mode === 'editor' && contract.previewImage && !isCompleted ? (
                    <div className={cx('contract-preview')}>
                        <img
                            src={contract.previewImage || '/placeholder.svg'}
                            alt="Contract preview"
                            className={cx('preview-image')}
                        />
                        <div className={cx('preview-info-overlay')}>
                            <div className={cx('contract-info')}>
                                <h4 className={cx('contract-title')}>{contract.title}</h4>
                                <div className={cx('contract-meta')}>
                                    <span className={cx('contract-id')}>{contract.id}</span>
                                    <span className={cx('start-date')}>Bắt đầu: {contract.startDate}</span>
                                </div>
                                {contract.description && (
                                    <p className={cx('contract-description')}>{contract.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h4 className={cx('contract-title')}>{contract.title}</h4>
                        <div className={cx('contract-meta')}>
                            <span className={cx('contract-id')}>{contract.id}</span>
                            {isCompleted && contract.endDate ? (
                                <span className={cx('date-range')}>
                                    {contract.startDate} - {contract.endDate}
                                </span>
                            ) : (
                                <span className={cx('start-date')}>Bắt đầu: {contract.startDate}</span>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className={cx('card-divider')}></div>

            <div className={cx('card-bottom')}>
                {!isCompleted ? (
                    <div className={cx('progress-section')}>
                        <div className={cx('progress-info')}>
                            <span>Tiến độ</span>
                            <span className={cx('progress-percent')}>{contract.progress}%</span>
                        </div>
                        <div className={cx('progress-bar')}>
                            <div className={cx('progress-fill')} style={{ width: `${contract.progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className={cx('completion-badge')}>
                        <span className={cx('check-icon')}>
                            <FontAwesomeIcon icon={faCheck} />
                        </span>
                        <span>Hoàn thành 100%</span>
                    </div>
                )}

                <div className={cx('card-footer')}>
                    <div className={cx('team-avatars')}>
                        {contract.participants?.slice(0, 3).map((participant) => (
                            <Avatar key={participant.id} name={participant.name} title={participant.name} />
                        ))}
                        {contract.participants && contract.participants.length > 3 && (
                            <div className={cx('avatar-small', 'count-avatar')}>
                                +{contract.participants.length - 3}
                            </div>
                        )}
                    </div>
                    <button
                        className={cx('expand-btn', { expanded: isExpanded })}
                        onClick={onToggleExpansion}
                        aria-label={isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                        title={isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    >
                        <FontAwesomeIcon icon={faChevronUp} />
                    </button>
                </div>

                <ExpandableSection
                    contract={contract}
                    isExpanded={isExpanded}
                    onToggle={onToggleExpansion}
                    isCompleted={isCompleted}
                />
            </div>
        </div>
    );
};

export default ContractCard;
