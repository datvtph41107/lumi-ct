import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import Input from '~/components/Input';
import classNames from 'classnames/bind';
import styles from '../BasicContractForm.module.scss';
import { generateContractCode } from '~/utils/contract.utils';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const cx = classNames.bind(styles);

export const ContractManagementSection = () => {
    const { setValue, watch } = useFormContext();
    const contractType = watch('contractType');

    useEffect(() => {
        if (contractType) {
            const newCode = generateContractCode(contractType);
            setValue('contractCode', newCode);
        }
    }, [contractType]);

    return (
        <div className={cx('section-card')}>
            <h3>
                <FontAwesomeIcon icon={faCode} />
                1. Quản lý hợp đồng
            </h3>
            <div className={cx('form-grid')}>
                <Input
                    disabled
                    name="contractCode"
                    label="Mã hợp đồng *"
                    placeholder="Mã hợp đồng tự động"
                    required="Vui lòng nhập mã hợp đồng"
                />
            </div>
        </div>
    );
};
