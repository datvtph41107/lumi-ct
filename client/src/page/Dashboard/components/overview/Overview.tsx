import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract, faCalendarAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import styles from "./Overview.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

interface ContractData {
    id: string;
    title: string;
    client: string;
    startDate: string;
    endDate: string;
    status: "active" | "completed" | "pending" | "expired";
    progress: number;
    value: string;
}

const Overview = () => {
    const navigate = useNavigate();
    // Sample contract data
    const contract: ContractData = {
        id: "HD001",
        title: "Hợp đồng giao dịch thương mại",
        client: "Công ty ABC",
        startDate: "23/07/2025",
        endDate: "24/08/2025",
        status: "active",
        progress: 75,
        value: "500,000,000 VNĐ",
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "#1a7f37";
            case "active":
                return "#0969da";
            case "pending":
                return "#bf8700";
            case "expired":
                return "#d72c0d";
            default:
                return "#8a8a8a";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Hoàn thành";
            case "active":
                return "Đang thực hiện";
            case "pending":
                return "Chờ xử lý";
            case "expired":
                return "Hết hạn";
            default:
                return "Không xác định";
        }
    };

    const handleContractClick = (contractId: string) => {
        navigate(`/contract-detail/${contractId}`);
    };

    return (
        <div className={cx("contract-card")} onClick={() => handleContractClick(contract.id)}>
            <div className={cx("card-header")}>
                <div className={cx("contract-info")}>
                    <div className={cx("contract-id")}>#{contract.id}</div>
                    <h4 className={cx("contract-title")}>{contract.title}</h4>
                </div>
                <div className={cx("status-badge")} style={{ backgroundColor: getStatusColor(contract.status) }}>
                    {getStatusText(contract.status)}
                </div>
            </div>

            <div className={cx("card-content")}>
                <div className={cx("info-row")}>
                    <div className={cx("info-item")}>
                        <FontAwesomeIcon icon={faUser} className={cx("icon")} />
                        <span>Khách hàng:</span>
                        <strong>{contract.client}</strong>
                    </div>
                </div>

                <div className={cx("info-row")}>
                    <div className={cx("info-item")}>
                        <FontAwesomeIcon icon={faCalendarAlt} className={cx("icon")} />
                        <span>Thời gian:</span>
                        <strong>
                            {contract.startDate} - {contract.endDate}
                        </strong>
                    </div>
                </div>

                <div className={cx("info-row")}>
                    <div className={cx("info-item")}>
                        <FontAwesomeIcon icon={faFileContract} className={cx("icon")} />
                        <span>Giá trị:</span>
                        <strong>{contract.value}</strong>
                    </div>
                </div>

                <div className={cx("progress-section")}>
                    <div className={cx("progress-header")}>
                        <span>Tiến độ thực hiện</span>
                        <span className={cx("progress-percent")}>{contract.progress}%</span>
                    </div>
                    <div className={cx("progress-bar")}>
                        <div className={cx("progress-fill")} style={{ width: `${contract.progress}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
