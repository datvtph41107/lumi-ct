import React from "react";
import styles from "./CircularPercent.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

type Props = {
    percent: number; // 0 - 100
    size?: number; // optional, default 24px
};

const getColor = (percent: number): "green" | "red" | "orange" | "gray" => {
    if (percent >= 80) return "green";
    if (percent >= 50) return "orange";
    if (percent > 0) return "red";
    return "gray";
};

const CircularPercent: React.FC<Props> = ({ percent, size = 24 }) => {
    const radius = 10;
    const stroke = 3;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const colorClass = getColor(percent);

    return (
        <div className={cx("circle-wrapper")} style={{ width: size, height: size }}>
            <svg height={size} width={size}>
                <circle stroke="#e5e7eb" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={size / 2} cy={size / 2} />
                <circle
                    className={cx("progress", colorClass)}
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
        </div>
    );
};

export default CircularPercent;
