import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit, faUsers, faProjectDiagram, faEye } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./ProgressBarHeader.module.scss";

const cx = classNames.bind(styles);

interface ProgressBarHeaderProps {
    currentStage: number;
    isVisible?: boolean;
    isAtTop?: boolean;
}

const steps = [
    {
        id: 1,
        label: "Soạn thảo",
        icon: faEdit,
        description: "Thông tin chung & tài liệu",
    },
    {
        id: 2,
        label: "Thông tin các bên",
        icon: faUsers,
        description: "Chi tiết bên A & bên B",
    },
    {
        id: 3,
        label: "Mốc thời gian",
        icon: faProjectDiagram,
        description: "Lập kế hoạch & công việc",
    },
    {
        id: 4,
        label: "Xem trước",
        icon: faEye,
        description: "Kiểm tra & hoàn tất",
    },
];

const ProgressBarHeader = ({ currentStage, isVisible = true, isAtTop = true }: ProgressBarHeaderProps) => {
    const getStepStatus = (stepId: number) => {
        if (stepId < currentStage) return "completed";
        if (stepId === currentStage) return "active";
        return "upcoming";
    };

    return (
        <div
            className={cx("wrapper", {
                hidden: !isVisible,
                collapsed: !isAtTop && isVisible,
                expanded: isAtTop,
            })}
        >
            <div className={cx("container")}>
                <div className={cx("progress-line")}>
                    <div className={cx("progress-fill")} style={{ width: `${((currentStage - 1) / (steps.length - 1)) * 100}%` }} />
                </div>

                {steps.map((step, index) => (
                    <div key={index} className={cx("step", getStepStatus(step.id))}>
                        <div className={cx("step-marker")}>
                            <div className={cx("step-number")}>
                                {getStepStatus(step.id) === "completed" ? (
                                    <FontAwesomeIcon icon={faCheck} />
                                ) : (
                                    <FontAwesomeIcon icon={step.icon} />
                                )}
                            </div>
                        </div>

                        <div className={cx("step-content")}>
                            <div className={cx("step-title")}>{step.label}</div>
                            <div className={cx("step-description")}>{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBarHeader;
