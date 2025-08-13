import { Controller, useFormContext } from "react-hook-form";
import { FileUploadSection } from "~/components/FileUpload/FileUploadSection"; // chỉnh path theo dự án
import classNames from "classnames/bind";
import styles from "./ControlledField.module.scss";
import type { FileAttachment } from "~/types/contract/contract.types";

const cx = classNames.bind(styles);

interface ControlledFileUploadFieldProps {
    name: string;
    label?: string;
    className?: string;
    maxFiles?: number;
    maxFileSize?: number;
    requiredMessage?: string;
    acceptedTypes?: string[];
}

const ControlledFileUploadField: React.FC<ControlledFileUploadFieldProps> = ({
    name,
    label = "Tài liệu đính kèm",
    className,
    maxFiles = 10,
    maxFileSize = 10,
    requiredMessage = "Vui lòng đính kèm ít nhất 1 tài liệu",
    acceptedTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt"],
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <div className={cx("form-group", "custom-upload", className)}>
            {label && <label className={cx("form-label")}>{label}</label>}

            <Controller
                name={name}
                control={control}
                // rules={{
                //     validate: (value: FileAttachment[]) => (value && value.length > 0 ? true : requiredMessage),
                // }}
                render={({ field }) => (
                    <FileUploadSection
                        files={field.value || []}
                        onFilesChange={field.onChange}
                        maxFiles={maxFiles}
                        maxFileSize={maxFileSize}
                        acceptedTypes={acceptedTypes}
                    />
                )}
            />

            {errors[name] && <p className={cx("error-message")}>{String(errors[name]?.message)}</p>}
        </div>
    );
};

export default ControlledFileUploadField;
