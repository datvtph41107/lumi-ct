import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faSave } from '@fortawesome/free-solid-svg-icons';
import Form from '~/components/Form/Form';
import { ContractManagementSection } from './form-section/contract-management-section';
import { GeneralInfoSection } from './form-section/general-info-section';
import { ContractContentSection } from './form-section/contract-content-section';
import { ProgressSidebar } from '../../Sidebar/ProgressSidebar';
import { ContractTypeInfo } from '../../Sidebar/ContractTypeInfo';
import { useContractForm } from '~/hooks/useContractForm';
import type { ContractFormData } from '~/types/contract/contract.types';
import styles from './BasicContractForm.module.scss';
import classNames from 'classnames/bind';
import type { FieldErrors } from 'react-hook-form';
import { convertDateRange } from '~/utils/contract';
import { useAutoSave } from '~/hooks/useAutoSave';
import { useContractDraftStore } from '~/store/contract-draft-store';

const cx = classNames.bind(styles);

const BasicContractForm = () => {
    const { formData, updateFormData } = useContractForm();
    const { currentDraft } = useContractDraftStore();

    const { saveNow, setDirty } = useAutoSave(currentDraft?.id, formData, { enabled: !!currentDraft });

    useEffect(() => {
        console.log('BasicContractForm mounted, current formData:', formData);
    }, [formData]);

    const defaultValues: Partial<ContractFormData> = {
        name: formData?.name || '',
        contractCode: formData?.contractCode || '',
        contractType: formData?.contractType || 'employment',
        drafter: formData?.drafter || '',
        manager: formData?.manager || '',
        mode: formData?.mode || 'basic',
        dateRange: formData?.dateRange || { startDate: null, endDate: null },
        milestones: formData?.milestones || [],
        attachments: formData?.attachments || [],
        tags: formData?.tags || [],
        priority: formData?.priority || 'medium',
    };

    const handleFormSubmit = async (data: ContractFormData) => {
        const processedData: ContractFormData = {
            ...data,
            dateRange: data.dateRange ? convertDateRange(data.dateRange) : { startDate: null, endDate: null },
        };
        updateFormData(processedData);
        await saveNow();
    };

    const handleError = (errors: FieldErrors) => {
        console.log('Form validation errors:', errors);
    };

    return (
        <div className={cx('basic-form-container')}>
            <div className={cx('form-header')}>
                <h2>
                    <FontAwesomeIcon icon={faFileContract} />
                    Soạn thảo nội dung
                </h2>
                <button type="button" className={cx('save-button')} onClick={saveNow}>
                    <FontAwesomeIcon icon={faSave} /> Lưu
                </button>
            </div>
            <div className={cx('form-content')}>
                <div className={cx('form-section')}>
                    <Form<ContractFormData>
                        key={`step1-${JSON.stringify(defaultValues)}`}
                        className={cx('form-section')}
                        defaultValues={defaultValues}
                        onSubmit={handleFormSubmit}
                        onError={handleError}
                        onChange={() => setDirty(true)}
                    >
                        <ContractManagementSection />
                        <GeneralInfoSection />
                        <ContractContentSection selectedType={formData?.contractType || 'service'} />
                        <div className={cx('form-actions')}>
                            <button type="submit" className={cx('submit-button')}>
                                <FontAwesomeIcon icon={faFileContract} />
                                Lưu và tiếp tục
                            </button>
                        </div>
                    </Form>
                </div>
                <div className={cx('form-sidebar')}>
                    <ProgressSidebar />
                    <ContractTypeInfo selectedType={formData?.contractType || 'service'} />
                </div>
            </div>
        </div>
    );
};

export default BasicContractForm;
