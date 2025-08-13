import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";
import TableCard from "./TableCard";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Overview from "./components/overview/Overview";
import ChartOverview from "./components/chart/ChartOverview";
import ActivityStaff from "./components/activity/ActivityStaff";
import { routePrivate, routes } from "~/config/routes.config";
import { useAppDispatch } from "~/redux/hooks";
// import { getCurrentUser, setUser } from "~/redux/slices/auth.slice";
import { unwrapResult } from "@reduxjs/toolkit";
// import httpRequestPrivate from "~/utils/httpRequest";
// import useHttpRequestPrivate from "~/hooks/useHttpRequestPrivate";

const cx = classNames.bind(styles);

const Dashboard = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {}, []);
    const [showAll, setShowAll] = useState(false);
    // Sample contracts data
    const contracts = Array.from({ length: 5 }, (_, index) => ({
        id: `HD00${index + 1}`,
        title: `Hợp đồng ${
            index === 0
                ? "giao dịch thương mại"
                : index === 1
                ? "cung cấp dịch vụ"
                : index === 2
                ? "thuê mặt bằng"
                : index === 3
                ? "hợp tác kinh doanh"
                : "tư vấn pháp lý"
        }`,
        client: `Công ty ${String.fromCharCode(65 + index)}BC`,
        status: index === 0 ? "active" : index === 1 ? "completed" : index === 2 ? "pending" : index === 3 ? "active" : "expired",
        progress: Math.floor(Math.random() * 100),
    }));

    return (
        <div className={cx("wrapper")}>
            <TableCard />

            <div className={cx("overview")}>
                <div className={cx("overview-chart")}>
                    <div className={cx("overview-title")}>
                        <h3>Tổng quan hệ thống</h3>
                    </div>
                    <ChartOverview />
                    <div className={cx("overview-line")}>
                        <div className={cx("line")}></div>
                        <div className={cx("box-line")}>Hoạt động giám sát</div>
                        <div className={cx("line")}></div>
                    </div>
                    <div className={cx("overview-activity")}>
                        <ActivityStaff />
                    </div>
                </div>

                <div className={cx("overview-title")}>
                    <h3>Hợp đồng mới nhất</h3>
                    <Link to={routePrivate.contractPages}>
                        <FontAwesomeIcon icon={faChevronRight} /> Truy cập
                    </Link>
                </div>

                <div className={cx("overview-fade-wrapper")}>
                    <div className={cx("overview-group", { faded: !showAll })}>
                        {contracts.slice(0, showAll ? contracts.length : 3).map((contract, index) => (
                            <Overview key={contract.id} />
                        ))}
                    </div>

                    {!showAll && (
                        <button className={cx("see-more")} onClick={() => setShowAll(true)}>
                            Xem thêm
                        </button>
                    )}
                </div>

                {showAll && (
                    <div className={cx("see-less-wrapper")}>
                        <button className={cx("see-less")} onClick={() => setShowAll(false)}>
                            Thu gọn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
