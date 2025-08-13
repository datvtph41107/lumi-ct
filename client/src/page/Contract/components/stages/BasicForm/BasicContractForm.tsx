
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import Form from "~/components/Form/Form";
import { ContractManagementSection } from "./form-section/contract-management-section";
import { GeneralInfoSection } from "./form-section/general-info-section";
import { ContractContentSection } from "./form-section/contract-content-section";
import { ProgressSidebar } from "../../Sidebar/ProgressSidebar";
import { ContractTypeInfo } from "../../Sidebar/ContractTypeInfo";
import { useContractForm } from "~/hooks/useContractForm";
import type { ContractFormData } from "~/types/contract/contract.types";
import styles from "./BasicContractForm.module.scss";
import classNames from "classnames/bind";
import type { FieldErrors } from "react-hook-form";
import { convertDateRange } from "~/utils/contract";

const cx = classNames.bind(styles);

const BasicContractForm = () => {
    const { formData, setStep1Data, nextStep, validateStep, currentStep } = useContractForm();

    // Ensure we're on step 1
    useEffect(() => {
        console.log("BasicContractForm mounted, current formData:", formData);
    }, [formData]);

    Create defaultValues from current formData
    const defaultValues: Partial<ContractFormData> = {
        name: formData.name || "",
        contractCode: formData.contractCode || "",
        contractType: formData.contractType || "employment",
        drafter: formData.drafter || "",
        manager: formData.manager || "",
        mode: formData.mode || "basic",
        dateRange: formData.dateRange || { startDate: null, endDate: null },
        details: formData.details || { description: "" },
        structuredData: formData.structuredData || {},
        milestones: formData.milestones || [],
        notificationSettings: formData.notificationSettings || {
            contractNotifications: [],
            milestoneNotifications: [],
            taskNotifications: [],
            globalSettings: {
                enableEmailNotifications: true,
                enableSMSNotifications: false,
                enableInAppNotifications: true,
                enablePushNotifications: true,
                defaultRecipients: [],
                workingHours: {
                    start: "09:00",
                    end: "17:00",
                    timezone: "Asia/Ho_Chi_Minh",
                },
            },
        },
    };

    const handleFormSubmit = (data: ContractFormData) => {
        console.log("Form submitted with data:", data);

        // Process date range if needed
        const processedData: ContractFormData = {
            ...data,
            dateRange: data.dateRange ? convertDateRange(data.dateRange) : { startDate: null, endDate: null },
        };

        // Save data to store
        // setStep1Data(processedData);

        // // Move to next step
        // nextStep();
    };

    const handleError = (errors: FieldErrors) => {
        console.log("Form validation errors:", errors);
    };

    return (
        <div className={cx("basic-form-container")}>
            <div className={cx("form-header")}>
                <h2>
                    <FontAwesomeIcon icon={faFileContract} />
                    Tạo hợp đồng mới - Giai đoạn {currentStep}
                </h2>
                <p>Điền thông tin cơ bản của hợp đồng để bắt đầu quá trình quản lý</p>
            </div>
            <div className={cx("form-content")}>
                <div className={cx("form-section")}>
                    <Form<ContractFormData>
                        key={`step1-${JSON.stringify(defaultValues)}`}
                        className={cx("form-section")}
                        defaultValues={defaultValues}
                        onSubmit={handleFormSubmit}
                        onError={handleError}
                    >
                        <ContractManagementSection />
                        <GeneralInfoSection />
                        <ContractContentSection selectedType={formData.contractType} />
                        <div className={cx("form-actions")}>
                            <button type="submit" className={cx("submit-button")}>
                                <FontAwesomeIcon icon={faFileContract} />
                                Lưu và tiếp tục đến giai đoạn 2
                            </button>
                        </div>
                    </Form>
                </div>
                <div className={cx("form-sidebar")}>
                    <ProgressSidebar />
                    <ContractTypeInfo selectedType={formData.contractType} />
                </div>
            </div>
        </div>
    );
};

export default BasicContractForm;
