import { Controller, useFormContext } from "react-hook-form";
import classNames from "classnames/bind";
import styles from "./ControlledField.module.scss";
import DatePicker from "~/components/DateRangePicker/DatePicker/DatePicker";
import { useState } from "react";

const cx = classNames.bind(styles);

interface ControlledDateTimeRangeFieldProps {
    name: string;
    label?: string;
    className?: string;
    requiredMessage?: string;
    onExternalChange?: (value: { startDate: Date | null; endDate: Date | null }) => void;
    error?: string; // ✅ Thêm error nhận từ ngoài
}

const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
};

export const ControlledDateTimeRangeField: React.FC<ControlledDateTimeRangeFieldProps> = ({
    name,
    label = "Chọn khoảng thời gian",
    className,
    error,
    onExternalChange,
    requiredMessage = "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc",
}) => {
    const { control } = useFormContext();

    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className={cx("form-group", className)}>
            {label && <label className={cx("form-label")}>{label} *</label>}
            <Controller
                name={name}
                control={control}
                rules={{
                    validate: (value) => {
                        if (!value?.startDate || !value?.endDate) {
                            return requiredMessage;
                        }

                        if (value.startDate >= value.endDate) {
                            return "Thời gian kết thúc phải sau thời gian bắt đầu";
                        }

                        return true;
                    },
                }}
                render={({ field }) => (
                    <>
                        <div className={cx("fake-input")} onClick={() => setShowPicker(true)}>
                            {field.value?.startDate && field.value?.endDate
                                ? `${formatDateTime(field.value.startDate)} - ${formatDateTime(field.value.endDate)}`
                                : "Chọn khoảng thời gian"}
                        </div>

                        {showPicker && (
                            <DatePicker
                                startDate={field.value?.startDate}
                                endDate={field.value?.endDate}
                                onDateChange={(startDate, endDate) => {
                                    const newValue = { startDate, endDate };
                                    field.onChange(newValue); // cập nhật vào react-hook-form
                                    onExternalChange?.(newValue); // callback truyền ra ngoài để cập nhật `formData.timeRange`
                                    setShowPicker(false); // ẩn picker
                                }}
                                onClose={() => setShowPicker(false)}
                            />
                        )}
                    </>
                )}
            />

            {error && <p className={cx("error-message")}>{error}</p>}
        </div>
    );
};
