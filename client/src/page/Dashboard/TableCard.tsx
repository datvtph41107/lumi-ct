import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dashboardData } from "./dashboardData";

const cx = classNames.bind(styles);

const TableCard = () => {
    return (
        <div className={cx("grid")}>
            {dashboardData.map((card, i) => (
                <div key={i} className={cx("card")}>
                    <div className={cx("card-title")}>
                        <FontAwesomeIcon className={cx("card-title_icon")} icon={card.icon} />
                        <h4>{card.title}</h4>
                    </div>
                    <ul>
                        {card.statuses.map((status, j) => (
                            <li key={j} className={cx("status", status.className)}>
                                <div className={cx("card-content_group", status.highlight && "progress")}>
                                    <FontAwesomeIcon
                                        className={cx("card-content_group-icon")}
                                        icon={status.icon}
                                        style={status.color ? { color: status.color } : undefined}
                                    />
                                    <span>{status.label}</span>
                                </div>
                                <strong className={cx(status.highlight && "progress_active")}>{status.value}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default TableCard;
