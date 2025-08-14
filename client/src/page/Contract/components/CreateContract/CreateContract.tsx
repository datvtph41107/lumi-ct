import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileAlt, 
    faEdit, 
    faUpload,
    faArrowRight,
    faInfoCircle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useContractDraftStore } from '~/store/contract-draft-store';
import type { ContractCreationMethod } from '~/types/contract/contract.types';
import styles from './CreateContract.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface CreateContractProps {
    onMethodSelect: (method: ContractCreationMethod) => void;
}

const CreateContract: React.FC<CreateContractProps> = ({ onMethodSelect }) => {
    const navigate = useNavigate();
    const { setCreationMethod } = useContractDraftStore();
    const [selectedMethod, setSelectedMethod] = useState<ContractCreationMethod | null>(null);

    const creationMethods = [
        {
            id: 'basic' as ContractCreationMethod,
            title: 'Soạn thảo Form',
            description: 'Tạo hợp đồng bằng cách điền các trường thông tin cơ bản',
            icon: faFileAlt,
            features: [
                'Điền form thông tin cơ bản',
                'Tự động tạo cấu trúc hợp đồng',
                'Phù hợp cho hợp đồng đơn giản',
                'Tốc độ tạo nhanh'
            ],
            bestFor: 'Hợp đồng có cấu trúc chuẩn, thông tin đơn giản'
        },
        {
            id: 'editor' as ContractCreationMethod,
            title: 'Soạn thảo Editor',
            description: 'Tạo hợp đồng bằng editor chuyên nghiệp với nhiều tính năng',
            icon: faEdit,
            features: [
                'Editor TipTap chuyên nghiệp',
                'Gợi ý soạn thảo thông minh',
                'Cấu trúc hợp đồng rõ ràng',
                'Hỗ trợ template đa dạng',
                'Chỉnh sửa chi tiết từng phần'
            ],
            bestFor: 'Hợp đồng phức tạp, cần chỉnh sửa chi tiết'
        },
        {
            id: 'uploadFile' as ContractCreationMethod,
            title: 'Tải file lên',
            description: 'Tải file hợp đồng có sẵn và chuyển đổi thành editor',
            icon: faUpload,
            features: [
                'Hỗ trợ file Word, PDF',
                'Tự động trích xuất nội dung',
                'Chuyển đổi sang editor',
                'Giữ nguyên định dạng',
                'Chỉnh sửa sau khi upload'
            ],
            bestFor: 'Có file hợp đồng sẵn, cần chỉnh sửa'
        }
    ];

    const handleMethodSelect = (method: ContractCreationMethod) => {
        setSelectedMethod(method);
        setCreationMethod(method);
    };

    const handleContinue = () => {
        if (selectedMethod) {
            onMethodSelect(selectedMethod);
            navigate('/contracts/collection');
        }
    };

    return (
        <div className={cx('create-contract')}>
            <div className={cx('header')}>
                <h1>Tạo hợp đồng mới</h1>
                <p>Chọn phương thức tạo hợp đồng phù hợp với nhu cầu của bạn</p>
            </div>

            <div className={cx('methods-container')}>
                {creationMethods.map((method) => (
                    <div
                        key={method.id}
                        className={cx('method-card', {
                            selected: selectedMethod === method.id
                        })}
                        onClick={() => handleMethodSelect(method.id)}
                    >
                        <div className={cx('method-header')}>
                            <div className={cx('method-icon')}>
                                <FontAwesomeIcon icon={method.icon} />
                            </div>
                            <div className={cx('method-info')}>
                                <h3>{method.title}</h3>
                                <p>{method.description}</p>
                            </div>
                            {selectedMethod === method.id && (
                                <div className={cx('selected-indicator')}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </div>
                            )}
                        </div>

                        <div className={cx('method-features')}>
                            <h4>Tính năng chính:</h4>
                            <ul>
                                {method.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={cx('method-best-for')}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <span>Phù hợp cho: {method.bestFor}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('actions')}>
                <button
                    className={cx('continue-btn', {
                        disabled: !selectedMethod
                    })}
                    onClick={handleContinue}
                    disabled={!selectedMethod}
                >
                    Tiếp tục
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>

            {selectedMethod && (
                <div className={cx('method-preview')}>
                    <h3>Phương thức đã chọn: {creationMethods.find(m => m.id === selectedMethod)?.title}</h3>
                    <p>Bạn sẽ được chuyển đến bước tiếp theo để chọn template hoặc bắt đầu soạn thảo.</p>
                </div>
            )}
        </div>
    );
};

export default CreateContract;