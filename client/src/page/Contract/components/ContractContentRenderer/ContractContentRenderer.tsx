import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileAlt, 
    faCalendarAlt, 
    faUser, 
    faBuilding,
    faMapMarkerAlt,
    faPhone,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import type { ContractTemplate } from '~/types/contract/contract.types';
import styles from './ContractContentRenderer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface ContractContentRendererProps {
    template: ContractTemplate;
    data: Record<string, any>;
    mode?: 'preview' | 'print' | 'export';
}

const ContractContentRenderer: React.FC<ContractContentRendererProps> = ({
    template,
    data,
    mode = 'preview'
}) => {
    const renderFieldValue = (fieldName: string, value: any) => {
        if (!value) return '___________';
        
        // Format based on field type
        if (fieldName.includes('date') || fieldName.includes('Date')) {
            return new Date(value).toLocaleDateString('vi-VN');
        }
        
        if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('salary')) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(Number(value));
        }
        
        return value.toString();
    };

    const renderTemplateContent = () => {
        if (template.content) {
            // Replace variables in template content
            let content = template.content;
            
            // Replace variables with actual data
            template.variables?.forEach(variable => {
                const value = data[variable] || '';
                const placeholder = `{{${variable}}}`;
                content = content.replace(new RegExp(placeholder, 'g'), renderFieldValue(variable, value));
            });
            
            return (
                <div 
                    className={cx('template-content')}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }
        
        // Fallback to field-based rendering
        return renderFieldsContent();
    };

    const renderFieldsContent = () => {
        if (!template.fields) return null;

        return (
            <div className={cx('fields-content')}>
                {template.fields.map((field, index) => (
                    <div key={field.id || index} className={cx('field-item')}>
                        <span className={cx('field-label')}>{field.label}:</span>
                        <span className={cx('field-value')}>
                            {renderFieldValue(field.name, data[field.name])}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const getContractHeader = () => {
        const contractName = data.contract_name || data.name || template.name;
        const contractType = data.contract_type || template.category;
        
        return (
            <div className={cx('contract-header')}>
                <div className={cx('header-main')}>
                    <h1 className={cx('contract-title')}>
                        <FontAwesomeIcon icon={faFileAlt} />
                        {contractName}
                    </h1>
                    <div className={cx('contract-meta')}>
                        <span className={cx('contract-type')}>{contractType}</span>
                        {data.contract_number && (
                            <span className={cx('contract-number')}>
                                Số: {data.contract_number}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className={cx('header-info')}>
                    <div className={cx('info-row')}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Ngày ký: {renderFieldValue('sign_date', data.sign_date)}</span>
                    </div>
                    {data.effective_date && (
                        <div className={cx('info-row')}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>Ngày hiệu lực: {renderFieldValue('effective_date', data.effective_date)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getPartiesSection = () => {
        const hasPartyA = data.party_a_name || data.company_name || data.employer_name;
        const hasPartyB = data.party_b_name || data.employee_name || data.contractor_name;
        
        if (!hasPartyA && !hasPartyB) return null;

        return (
            <div className={cx('parties-section')}>
                <h2>THÔNG TIN CÁC BÊN</h2>
                
                <div className={cx('parties-grid')}>
                    {hasPartyA && (
                        <div className={cx('party-card', 'party-a')}>
                            <h3>BÊN A</h3>
                            <div className={cx('party-info')}>
                                <div className={cx('info-item')}>
                                    <FontAwesomeIcon icon={faBuilding} />
                                    <span>Tên: {renderFieldValue('party_a_name', data.party_a_name || data.company_name || data.employer_name)}</span>
                                </div>
                                {data.party_a_address && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        <span>Địa chỉ: {data.party_a_address}</span>
                                    </div>
                                )}
                                {data.party_a_phone && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faPhone} />
                                        <span>Điện thoại: {data.party_a_phone}</span>
                                    </div>
                                )}
                                {data.party_a_email && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        <span>Email: {data.party_a_email}</span>
                                    </div>
                                )}
                                {data.party_a_representative && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>Người đại diện: {data.party_a_representative}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {hasPartyB && (
                        <div className={cx('party-card', 'party-b')}>
                            <h3>BÊN B</h3>
                            <div className={cx('party-info')}>
                                <div className={cx('info-item')}>
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>Tên: {renderFieldValue('party_b_name', data.party_b_name || data.employee_name || data.contractor_name)}</span>
                                </div>
                                {data.party_b_address && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        <span>Địa chỉ: {data.party_b_address}</span>
                                    </div>
                                )}
                                {data.party_b_phone && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faPhone} />
                                        <span>Điện thoại: {data.party_b_phone}</span>
                                    </div>
                                )}
                                {data.party_b_email && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        <span>Email: {data.party_b_email}</span>
                                    </div>
                                )}
                                {data.party_b_id && (
                                    <div className={cx('info-item')}>
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        <span>CMND/CCCD: {data.party_b_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getTermsSection = () => {
        const terms = [];
        
        // Employment contract specific terms
        if (template.category === 'employment') {
            if (data.position) terms.push({ title: 'Vị trí công việc', value: data.position });
            if (data.department) terms.push({ title: 'Phòng ban', value: data.department });
            if (data.salary) terms.push({ title: 'Mức lương', value: renderFieldValue('salary', data.salary) });
            if (data.work_location) terms.push({ title: 'Địa điểm làm việc', value: data.work_location });
            if (data.work_hours) terms.push({ title: 'Giờ làm việc', value: data.work_hours });
            if (data.probation_period) terms.push({ title: 'Thời gian thử việc', value: data.probation_period });
            if (data.contract_duration) terms.push({ title: 'Thời hạn hợp đồng', value: data.contract_duration });
        }
        
        // Service contract specific terms
        if (template.category === 'service') {
            if (data.service_type) terms.push({ title: 'Loại dịch vụ', value: data.service_type });
            if (data.service_description) terms.push({ title: 'Mô tả dịch vụ', value: data.service_description });
            if (data.service_fee) terms.push({ title: 'Phí dịch vụ', value: renderFieldValue('service_fee', data.service_fee) });
            if (data.service_duration) terms.push({ title: 'Thời gian thực hiện', value: data.service_duration });
        }
        
        // Business contract specific terms
        if (template.category === 'business') {
            if (data.product_name) terms.push({ title: 'Tên sản phẩm', value: data.product_name });
            if (data.quantity) terms.push({ title: 'Số lượng', value: data.quantity });
            if (data.unit_price) terms.push({ title: 'Đơn giá', value: renderFieldValue('unit_price', data.unit_price) });
            if (data.total_amount) terms.push({ title: 'Tổng tiền', value: renderFieldValue('total_amount', data.total_amount) });
        }
        
        if (terms.length === 0) return null;

        return (
            <div className={cx('terms-section')}>
                <h2>ĐIỀU KHOẢN CHÍNH</h2>
                <div className={cx('terms-list')}>
                    {terms.map((term, index) => (
                        <div key={index} className={cx('term-item')}>
                            <span className={cx('term-title')}>{term.title}:</span>
                            <span className={cx('term-value')}>{term.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getFooterSection = () => {
        return (
            <div className={cx('contract-footer')}>
                <div className={cx('signature-section')}>
                    <div className={cx('signature-party', 'party-a')}>
                        <h4>BÊN A</h4>
                        <div className={cx('signature-line')}>
                            <span>Chữ ký</span>
                        </div>
                        <div className={cx('representative-info')}>
                            <span>{data.party_a_representative || 'Người đại diện'}</span>
                        </div>
                    </div>
                    
                    <div className={cx('signature-party', 'party-b')}>
                        <h4>BÊN B</h4>
                        <div className={cx('signature-line')}>
                            <span>Chữ ký</span>
                        </div>
                        <div className={cx('representative-info')}>
                            <span>{data.party_b_name || data.employee_name || 'Người ký'}</span>
                        </div>
                    </div>
                </div>
                
                <div className={cx('contract-meta')}>
                    <p>Hợp đồng này được lập thành {data.contract_copies || 2} bản, mỗi bên giữ {Math.ceil((data.contract_copies || 2) / 2)} bản có giá trị pháp lý như nhau.</p>
                    <p>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('contract-content-renderer', mode)}>
            {getContractHeader()}
            {getPartiesSection()}
            {getTermsSection()}
            {renderTemplateContent()}
            {getFooterSection()}
        </div>
    );
};

export default ContractContentRenderer;