import styles from "./ActivityStaff.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const data = [
    {
        name: "Nguyen Van A",
        version: "8.9.0",
        devices: "36 devices",
        percentage: "100%",
        firstSeen: "Feb 25, 2024, 11:15 AM",
        threats: "2 threats detected",
    },
    {
        name: "Nguyen Van D",
        version: "118.0.1",
        devices: "7 devices",
        percentage: "19%",
        firstSeen: "Dec 5, 2023, 1:00 PM",
        threats: "1 threats detected",
    },
    {
        name: "Nguyen Van B",
        version: "3 versions",
        devices: "29 devices",
        percentage: "80%",
        firstSeen: "Jan 15, 2024, 2:15 PM",
        threats: "2 threats detected",
    },
    {
        name: "Nguyen Van C",
        version: "119.0.0",
        devices: "4 devices",
        percentage: "11%",
        firstSeen: "Jan 29, 2024, 6:30 PM",
        threats: "1 threats detected",
    },
];

const ActivityStaff = () => {
    return (
        <div className={cx("wrapper")}>
            <div className={cx("header")}>
                <div className={cx("header_label", "box")}>Name</div>
                <div className={cx("header_label", "box")}>Version</div>
                <div className={cx("header_label", "box")}>Devices</div>
                <div className={cx("header_label", "box")}>First Seen</div>
                <div className={cx("header_label", "box")}>Vulnerabilities</div>
            </div>
            {data.map((item, index) => (
                <div key={index} className={cx("row")}>
                    <div className={cx("box")}>{item.name}</div>
                    <div className={cx("box")}>{item.version}</div>
                    <div className={cx("box")}>
                        {item.devices}
                        <span className={cx("percentage")}>{item.percentage}</span>
                    </div>
                    <div className={cx("box")}>{item.firstSeen}</div>
                    <div className={cx("threats", "box")}>{item.threats}</div>
                </div>
            ))}
        </div>
    );
};

export default ActivityStaff;
