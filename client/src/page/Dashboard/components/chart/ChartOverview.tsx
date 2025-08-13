// src/components/framework/ChartOverview.tsx
import styles from "./ChartOverview.module.scss";
import classNames from "classnames/bind";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import CircularPercent from "~/components/CircularPercent";

const cx = classNames.bind(styles);

const frameworkList = [
    { name: "ISO 27001", value: 0, total: 89, percent: 0 },
    { name: "SOC 2 Type 2", value: 66, total: 89, percent: 76 },
    { name: "HIPAA", value: 9, total: 89, percent: 14 },
    { name: "PCI DSS", value: 64, total: 64, percent: 100 },
    { name: "PCI DSS", value: 64, total: 64, percent: 100 },
    { name: "PCI DSS", value: 64, total: 64, percent: 100 },
];

const barData = [
    { date: "Jan", assigned: 0, unassigned: 100 },
    { date: "Feb", assigned: 10, unassigned: 90 },
    { date: "Mar", assigned: 20, unassigned: 80 },
    { date: "Apr", assigned: 40, unassigned: 60 },
    { date: "May", assigned: 55, unassigned: 45 },
    { date: "Jun", assigned: 75, unassigned: 25 },
    { date: "Jun", assigned: 95, unassigned: 2 },
    { date: "Jun", assigned: 95, unassigned: 2 },
    { date: "Jun", assigned: 95, unassigned: 2 },
    { date: "Jun", assigned: 95, unassigned: 2 },
    { date: "Jun", assigned: 95, unassigned: 2 },
];

const pieData = [
    { name: "Passing", value: 65, color: "#29A37E" },
    { name: "Failing", value: 3, color: "#E74328" },
    { name: "Needs changes", value: 2, color: "#F56518" },
    { name: "In review", value: 7, color: "#5168D4" },
    { name: "Pending", value: 8, color: "#DDD9D6" },
    { name: "In progress", value: 7, color: "#F5AF13" },
];

const ChartOverview = () => {
    return (
        <div className={cx("container")}>
            {/* Left Panel liệt kê toàn bộ hợp đồng đã thực hiện - ngày tháng năm trang hợp đồng quản lý */}
            <div className={cx("panelLeft")}>
                <div className={cx("panelHeader")}>
                    <h4>Hợp đồng / Thể loại</h4>
                    <Link to="#">
                        Chi tiết <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                </div>
                <ul className={cx("frameworkList")}>
                    {frameworkList.map((item, index) => (
                        <li key={index} className={cx("frameworkItem")}>
                            <div className={cx("name")}>
                                <div className={cx("name_avatar")}></div>
                                {item.name}
                            </div>
                            <div className={cx("value")}>
                                {item.value}/{item.total}
                            </div>
                            <div className={cx("percent")}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <CircularPercent percent={item.percent} size={20} />
                                    {item.percent}%
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Middle Chart */}
            <div className={cx("panelMiddle")}>
                <h4>100% Hợp đồng trong năm</h4>
                <ResponsiveContainer width="94%" height={200}>
                    <BarChart data={barData} stackOffset="expand">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value * 100)}%`} domain={[0, 1]} />
                        <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar fontSize={12} dataKey="assigned" stackId="a" fill="#4969D8" name="Đã giao" />
                        <Bar fontSize={12} dataKey="unassigned" stackId="a" fill="#B0BEED" name="Chưa giao" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Right Panel: Pie Chart with Center Label and Legend */}
            <div className={cx("panelRight")}>
                <h4>73% Hợp đồng hoàn thành / tháng</h4>
                <div className={cx("donutWrapperRow")}>
                    <ul className={cx("pieLegend")}>
                        {pieData.map((item, index) => (
                            <li key={index}>
                                <span style={{ backgroundColor: item.color }}></span>
                                {item.name} <strong>{item.value}</strong>
                            </li>
                        ))}
                    </ul>
                    <div className={cx("donutWrapper")}>
                        <ResponsiveContainer width={200} height={160}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={2}
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className={cx("donutCenter")}>
                            <div className={cx("donutNumber")}>89</div>
                            <div className={cx("donutLabel")}>Hợp đồng</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartOverview;
