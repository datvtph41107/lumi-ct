import { Controller, useFormContext } from "react-hook-form";
import DateRangePicker from "~/components/DateRangePicker/DateRangePicker";
import classNames from "classnames/bind";
import styles from "./ControlledField.module.scss";

const cx = classNames.bind(styles);

interface ControlledDateRangeFieldProps {
    name: string;
    label?: string;
    className?: string;
    placeholder?: string;
    requiredMessage?: string;
    onExternalChange?: (value: { startDate: Date | null; endDate: Date | null }) => void;
}

const ControlledDateRangeField: React.FC<ControlledDateRangeFieldProps> = ({
    name,
    label = "Thời gian hiệu lực",
    className,
    placeholder = "Chọn thời gian bắt đầu và kết thúc",
    requiredMessage = "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc",
    onExternalChange,
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <div className={cx("form-group", "custom-date-range", className)}>
            {label && <label className={cx("form-label")}>{label} *</label>}

            <Controller
                name={name}
                control={control}
                rules={{
                    validate: (value) => (value?.startDate && value?.endDate ? true : requiredMessage),
                }}
                render={({ field }) => (
                    <DateRangePicker
                        value={field.value}
                        onChange={(value) => {
                            field.onChange(value);
                            onExternalChange?.(value);
                        }}
                        placeholder={placeholder}
                    />
                )}
            />

            {errors[name] && <p className={cx("error-message")}>{String(errors[name]?.message)}</p>}
        </div>
    );
};

export default ControlledDateRangeField;
