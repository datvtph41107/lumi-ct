// import { useContractForm } from "~/hooks/useContractForm";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

const cx = classNames.bind(styles);

const PROGRESS_STEPS = [
    {
        number: 1,
        title: "Thông tin cơ bản",
        description: "Điền thông tin chung về hợp đồng",
    },
    {
        number: 2,
        title: "Mốc thời gian & Công việc",
        description: "Thiết lập giai đoạn và phân công",
    },
    {
        number: 3,
        title: "Xem trước & Hoàn tất",
        description: "Kiểm tra và hoàn thiện hợp đồng",
    },
];

export const ProgressSidebar = () => {
    // const { currentStep, completedSteps } = useContractForm();

    return (
        <div className={cx("progress-card")}>
            {/* <h4>Tiến độ tạo hợp đồng</h4>
            <div className={cx("progress-steps")}>
                {PROGRESS_STEPS.map((step) => {
                    const isActive = currentStep === step.number;
                    const isCompleted = completedSteps.includes(step.number);
                    const isAccessible = step.number <= currentStep || isCompleted;

                    return (
                        <div
                            key={step.number}
                            className={cx("step", {
                                active: isActive,
                                completed: isCompleted,
                                accessible: isAccessible,
                            })}
                        >
                            <span
                                className={cx("step-number", {
                                    completed: isCompleted,
                                })}
                            >
                                {isCompleted ? "✓" : step.number}
                            </span>
                            <div className={cx("step-content")}>
                                <h5>{step.title}</h5>
                                <p>{step.description}</p>
                                {isActive && (
                                    <div className={cx("step-indicator")}>
                                        <span>Đang thực hiện</span>
                                    </div>
                                )}
                                {isCompleted && (
                                    <div className={cx("step-completed")}>
                                        <span>Đã hoàn thành</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div> */}
        </div>
    );
};
