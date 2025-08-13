import classNames from "classnames/bind";
import styles from "./NotificationModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightAndDownLeftFromCenter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { BsCheckAll } from "react-icons/bs";
import dayjs from "dayjs";

const cx = classNames.bind(styles);

interface Props {
    onClose: () => void;
    collapsed: boolean;
}

type NotificationItem = {
    id: number;
    user: string;
    content: string;
    date: string;
    iconType: string;
    unread: boolean;
};

const notifications: NotificationItem[] = [
    {
        id: 1,
        user: "John Doe",
        content: "submitted a leave request",
        date: "2024-07-16T21:00:00", // ISO format
        iconType: "user",
        unread: true,
    },
    {
        id: 2,
        user: "Emily Davis",
        content: "set up a meeting for July 20, 2024, at 3:00 PM",
        date: "2024-07-17T15:47:00",
        iconType: "calendar",
        unread: true,
    },
    {
        id: 3,
        user: "Emily Davis",
        content: "set up a meeting for July 20, 2024, at 3:00 PM",
        date: "2024-07-17T15:47:00",
        iconType: "calendar",
        unread: true,
    },
    {
        id: 3,
        user: "Emily Davis",
        content: "set up a meeting for July 20, 2024, at 3:00 PM",
        date: "2024-09-17T15:47:00",
        iconType: "calendar",
        unread: true,
    },
    {
        id: 3,
        user: "Emily Davis",
        content: "set up a meeting for July 20, 2024, at 3:00 PM",
        date: "2024-09-17T15:47:00",
        iconType: "calendar",
        unread: false,
    },

    // ...
];

function groupByDay(notifications: NotificationItem[]) {
    const today = dayjs();
    const tomorrow = today.add(1, "day");

    const sections: Record<string, typeof notifications> = {};

    for (const item of notifications) {
        const date = dayjs(item.date);

        let label = date.format("MMMM D, YYYY");
        if (date.isSame(today, "day")) label = "Today";
        else if (date.isSame(tomorrow, "day")) label = "Tomorrow";

        if (!sections[label]) sections[label] = [];
        sections[label].push(item);
    }

    return sections;
}

const NotificationModal = ({ onClose, collapsed }: Props) => {
    const grouped = groupByDay(notifications);

    return (
        <div className={cx("overlay", { collapsed })}>
            <div className={cx("wrapper")}>
                <div className={cx("header")}>
                    <div className={cx("header_left")}>
                        <h4>Notifications</h4>
                        <p>Stay Updated with Your Latest Notifications</p>
                    </div>
                    <div className={cx("header_right")}>
                        <button className={cx("header_left-icon")}>
                            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
                        </button>
                        <button className={cx("header_right-icon")} onClick={onClose}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>
                <div className={cx("filters")}>
                    <button className={cx("active")}>All</button>
                    <button>Unread (12)</button>
                    <button className={cx("mark-read")}>
                        <BsCheckAll className={cx("mark-read_icon")} /> Mark all as read
                    </button>
                </div>

                <div className={cx("list")}>
                    {Object.entries(grouped).map(([dayLabel, items]) => (
                        <div key={dayLabel}>
                            <p className={cx("day-label")}>{dayLabel}</p>
                            {items.map((item, index) => (
                                <div key={index} className={cx("item", { unread: item.unread })}>
                                    <div className={cx("icon", item.iconType)} />
                                    <div className={cx("info")}>
                                        <p>
                                            <strong>{item.user}</strong> {item.content}
                                        </p>
                                        <span>{dayjs(item.date).format("MMMM D, YYYY · hh:mm A")}</span>
                                    </div>
                                    {item.unread ? <span className={cx("dot")} /> : <BsCheckAll className={cx("mark")} />}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
