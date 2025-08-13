import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import classNames from "classnames/bind";
import styles from "./Select.module.scss";

const cx = classNames.bind(styles);

interface SelectProps {
    name: string;
    label?: string;
    options: { value: string; label: string }[];
    required?: string;
    disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({ name, label, options, required, disabled }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <div className={cx("form-group")}>
            {label && (
                <label htmlFor={name} className={cx("form-label")}>
                    {label}
                </label>
            )}
            <select
                id={name}
                {...register(name, { required })}
                className={cx("form-input", { error: errors[name], disable: disabled })}
                disabled={disabled}
            >
                <option value="">-- Chọn --</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ErrorMessage errors={errors} name={name} render={({ message }) => <p className={cx("error-message")}>{message}</p>} />
        </div>
    );
};

export default Select;
