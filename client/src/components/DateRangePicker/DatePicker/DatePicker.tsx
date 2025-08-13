import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./DatePicker.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faChevronUp, faChevronDown, faClock, faTimes } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

interface DatePickerProps {
    startDate?: Date;
    endDate?: Date;
    onDateChange?: (startDate: Date | null, endDate: Date | null) => void;
    onClose?: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ startDate, endDate, onDateChange, onClose }) => {
    const [leftMonth, setLeftMonth] = useState(new Date());
    const [rightMonth, setRightMonth] = useState(() => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
    });
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(startDate || null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endDate || null);
    const [isSelectingEnd, setIsSelectingEnd] = useState(false);

    // Time toggle state
    const [showTimeSelector, setShowTimeSelector] = useState(false);

    // Time states
    const [startTime, setStartTime] = useState({
        hour: startDate?.getHours() || 9,
        minute: startDate?.getMinutes() || 0,
    });
    const [endTime, setEndTime] = useState({
        hour: endDate?.getHours() || 17,
        minute: endDate?.getMinutes() || 0,
    });

    const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ];

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    // Handle overlay click to close modal
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    // Handle close button click
    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    // Handle escape key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && onClose) {
            onClose();
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateClick = (date: Date) => {
        // Không cho phép chọn ngày trong quá khứ
        if (isDateDisabled(date)) {
            return;
        }

        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            // Bắt đầu chọn mới
            const newStartDate = new Date(date);
            if (showTimeSelector) {
                newStartDate.setHours(startTime.hour, startTime.minute, 0, 0);
            } else {
                newStartDate.setHours(0, 0, 0, 0);
            }
            setSelectedStartDate(newStartDate);
            setSelectedEndDate(null);
            setIsSelectingEnd(true);
        } else if (isSelectingEnd) {
            // Chọn ngày kết thúc
            if (date >= selectedStartDate) {
                const newEndDate = new Date(date);
                if (showTimeSelector) {
                    newEndDate.setHours(endTime.hour, endTime.minute, 0, 0);
                } else {
                    newEndDate.setHours(23, 59, 59, 999);
                }
                setSelectedEndDate(newEndDate);
                setIsSelectingEnd(false);
            } else {
                // Nếu ngày được chọn trước ngày bắt đầu, đặt làm ngày bắt đầu mới
                const newStartDate = new Date(date);
                if (showTimeSelector) {
                    newStartDate.setHours(startTime.hour, startTime.minute, 0, 0);
                } else {
                    newStartDate.setHours(0, 0, 0, 0);
                }
                setSelectedStartDate(newStartDate);
                setSelectedEndDate(null);
            }
        }
    };

    const handleTimeChange = (type: "start" | "end", field: "hour" | "minute", value: number) => {
        if (type === "start") {
            const newStartTime = { ...startTime, [field]: value };
            setStartTime(newStartTime);

            if (selectedStartDate) {
                const newDate = new Date(selectedStartDate);
                newDate.setHours(newStartTime.hour, newStartTime.minute, 0, 0);
                setSelectedStartDate(newDate);
            }
        } else {
            const newEndTime = { ...endTime, [field]: value };
            setEndTime(newEndTime);

            if (selectedEndDate) {
                const newDate = new Date(selectedEndDate);
                newDate.setHours(newEndTime.hour, newEndTime.minute, 0, 0);
                setSelectedEndDate(newDate);
            }
        }
    };

    const handleTimeToggle = () => {
        setShowTimeSelector(!showTimeSelector);

        // Cập nhật lại thời gian cho các ngày đã chọn
        if (!showTimeSelector) {
            // Bật time selector - áp dụng thời gian cụ thể
            if (selectedStartDate) {
                const newStartDate = new Date(selectedStartDate);
                newStartDate.setHours(startTime.hour, startTime.minute, 0, 0);
                setSelectedStartDate(newStartDate);
            }
            if (selectedEndDate) {
                const newEndDate = new Date(selectedEndDate);
                newEndDate.setHours(endTime.hour, endTime.minute, 0, 0);
                setSelectedEndDate(newEndDate);
            }
        } else {
            // Tắt time selector - đặt về cả ngày
            if (selectedStartDate) {
                const newStartDate = new Date(selectedStartDate);
                newStartDate.setHours(0, 0, 0, 0);
                setSelectedStartDate(newStartDate);
            }
            if (selectedEndDate) {
                const newEndDate = new Date(selectedEndDate);
                newEndDate.setHours(23, 59, 59, 999);
                setSelectedEndDate(newEndDate);
            }
        }
    };

    const isDateSelected = (date: Date) => {
        if (!selectedStartDate) return false;

        if (selectedStartDate && !selectedEndDate) {
            return date.toDateString() === selectedStartDate.toDateString();
        }

        if (selectedStartDate && selectedEndDate) {
            const startDateOnly = new Date(selectedStartDate);
            startDateOnly.setHours(0, 0, 0, 0);
            const endDateOnly = new Date(selectedEndDate);
            endDateOnly.setHours(0, 0, 0, 0);
            const currentDateOnly = new Date(date);
            currentDateOnly.setHours(0, 0, 0, 0);

            return currentDateOnly >= startDateOnly && currentDateOnly <= endDateOnly;
        }

        return false;
    };

    const isStartDate = (date: Date) => {
        return selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    };

    const isEndDate = (date: Date) => {
        return selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
    };

    const formatDateTime = (date: Date | null) => {
        if (!date) return "";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        if (showTimeSelector) {
            const hour = date.getHours().toString().padStart(2, "0");
            const minute = date.getMinutes().toString().padStart(2, "0");
            return `${day}.${month}.${year} ${hour}:${minute}`;
        } else {
            return `${day}.${month}.${year}`;
        }
    };

    const handleSave = () => {
        if (onDateChange) {
            onDateChange(selectedStartDate, selectedEndDate);
        }
        if (onClose) {
            onClose();
        }
    };

    const navigateLeftMonth = (direction: "prev" | "next") => {
        const newMonth = new Date(leftMonth);
        if (direction === "prev") {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setLeftMonth(newMonth);
    };

    const navigateRightMonth = (direction: "prev" | "next") => {
        const newMonth = new Date(rightMonth);
        if (direction === "prev") {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setRightMonth(newMonth);
    };

    const TimeSelector = ({
        // type,
        time,
        onChange,
    }: {
        type: "start" | "end";
        time: { hour: number; minute: number };
        onChange: (field: "hour" | "minute", value: number) => void;
    }) => {
        return (
            <div className={cx("time-selector")}>
                <div className={cx("time-field")}>
                    <label>Giờ</label>
                    <div className={cx("time-input")}>
                        <button
                            type="button"
                            onClick={() => onChange("hour", time.hour < 23 ? time.hour + 1 : 0)}
                            className={cx("time-btn")}
                        >
                            <FontAwesomeIcon icon={faChevronUp} />
                        </button>
                        <span className={cx("time-value")}>{time.hour.toString().padStart(2, "0")}</span>
                        <button
                            type="button"
                            onClick={() => onChange("hour", time.hour > 0 ? time.hour - 1 : 23)}
                            className={cx("time-btn")}
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                    </div>
                </div>

                <div className={cx("time-separator")}>:</div>

                <div className={cx("time-field")}>
                    <label>Phút</label>
                    <div className={cx("time-input")}>
                        <button
                            type="button"
                            onClick={() => onChange("minute", time.minute < 59 ? time.minute + 1 : 0)}
                            className={cx("time-btn")}
                        >
                            <FontAwesomeIcon icon={faChevronUp} />
                        </button>
                        <span className={cx("time-value")}>{time.minute.toString().padStart(2, "0")}</span>
                        <button
                            type="button"
                            onClick={() => onChange("minute", time.minute > 0 ? time.minute - 1 : 59)}
                            className={cx("time-btn")}
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCalendar = (date: Date, isLeft: boolean) => {
        const days = getDaysInMonth(date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        return (
            <div className={cx("calendar")}>
                <div className={cx("calendar-header")}>
                    <button
                        type="button"
                        className={cx("calendar-nav-btn", "prev")}
                        onClick={() => (isLeft ? navigateLeftMonth("prev") : navigateRightMonth("prev"))}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h3>{monthYear}</h3>
                    <button
                        type="button"
                        className={cx("calendar-nav-btn", "next")}
                        onClick={() => (isLeft ? navigateLeftMonth("next") : navigateRightMonth("next"))}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
                <div className={cx("calendar-grid")}>
                    {dayNames.map((day) => (
                        <div key={day} className={cx("day-header")}>
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={cx("day-cell", {
                                empty: !day,
                                disabled: day && isDateDisabled(day),
                                selected: day && isDateSelected(day),
                                "start-date": day && isStartDate(day),
                                "end-date": day && isEndDate(day),
                                "in-range":
                                    day &&
                                    selectedStartDate &&
                                    selectedEndDate &&
                                    day >
                                        new Date(
                                            selectedStartDate.getFullYear(),
                                            selectedStartDate.getMonth(),
                                            selectedStartDate.getDate(),
                                        ) &&
                                    day < new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate()),
                            })}
                            onClick={() => day && handleDateClick(day)}
                        >
                            {day ? day.getDate() : ""}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={cx("date-picker-overlay")} onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={-1}>
            <div className={cx("date-picker")}>
                {/* Close Button */}
                <button type="button" className={cx("close-button")} onClick={handleCloseClick} aria-label="Đóng">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className={cx("calendars-container")}>
                    {renderCalendar(leftMonth, true)}
                    {renderCalendar(rightMonth, false)}
                </div>

                {/* Time Toggle Button */}
                <div className={cx("time-toggle-section")}>
                    <button className={cx("time-toggle-btn", { active: showTimeSelector })} onClick={handleTimeToggle}>
                        <FontAwesomeIcon icon={faClock} />
                        <span>{showTimeSelector ? "Ẩn thời gian chi tiết" : "Thêm thời gian chi tiết"}</span>
                    </button>
                </div>

                {/* Time Section - Only show when enabled */}
                {showTimeSelector && (
                    <div className={cx("time-section")}>
                        <div className={cx("time-group")}>
                            <h4>Thời gian bắt đầu</h4>
                            <TimeSelector
                                type="start"
                                time={startTime}
                                onChange={(field, value) => handleTimeChange("start", field, value)}
                            />
                        </div>

                        <div className={cx("time-group")}>
                            <h4>Thời gian kết thúc</h4>
                            <TimeSelector type="end" time={endTime} onChange={(field, value) => handleTimeChange("end", field, value)} />
                        </div>
                    </div>
                )}

                <div className={cx("date-inputs")}>
                    <div className={cx("date-input-group")}>
                        <label>{showTimeSelector ? "Ngày giờ bắt đầu" : "Ngày bắt đầu"}</label>
                        <div className={cx("date-input")}>{formatDateTime(selectedStartDate)}</div>
                    </div>

                    <div className={cx("date-input-group")}>
                        <label>{showTimeSelector ? "Ngày giờ kết thúc" : "Ngày kết thúc"}</label>
                        <div className={cx("date-input")}>{formatDateTime(selectedEndDate)}</div>
                    </div>

                    <button type="button" className={cx("save-button")} onClick={handleSave}>
                        {showTimeSelector ? "Lưu ngày giờ" : "Lưu ngày"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatePicker;
