import type React from "react";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faChevronDown, faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./DateRangePicker.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

interface Props {
    value?: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
    disabled?: boolean;
}

const parseDate = (d: Date | string | null | undefined): Date | null => {
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime()) ? null : date;
};

const normalizeDate = (d: Date | string | null | undefined): Date | null => {
    const date = parseDate(d);
    return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
};

const isSameDay = (a: Date | string | null, b: Date | string | null): boolean => {
    const da = normalizeDate(a),
        db = normalizeDate(b);
    return !!(da && db && da.getTime() === db.getTime());
};

const formatDate = (input: Date | string | null): string => {
    const date = parseDate(input);
    if (!date) return "";
    const str = date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    const vn = new Date(str);
    return `${String(vn.getDate()).padStart(2, "0")}/${String(vn.getMonth() + 1).padStart(2, "0")}/${vn.getFullYear()}`;
};

const DateRangePicker: React.FC<Props> = ({
    value = { startDate: null, endDate: null },
    onChange,
    placeholder = "Chọn khoảng thời gian",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingStart, setSelectingStart] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const today = normalizeDate(new Date())!;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear(),
            month = date.getMonth();
        const start = new Date(year, month, 1).getDay();
        const total = new Date(year, month + 1, 0).getDate();
        const days = Array(start)
            .fill(null)
            .concat([...Array(total)].map((_, i) => new Date(year, month, i + 1)));
        return days;
    };

    const isDateInRange = (date: Date) => {
        const d = normalizeDate(date);
        const start = normalizeDate(value.startDate);
        const end = normalizeDate(value.endDate);
        return !!(d && start && end && d >= start && d <= end);
    };

    const isDateDisabled = (date: Date) => normalizeDate(date)! < today;

    const handleDateClick = (date: Date) => {
        if (disabled || isDateDisabled(date)) return;
        const base = parseDate(date)!;
        const selected = new Date(base);
        selected.setHours(selectingStart ? 8 : 17, 0, 0, 0);

        if (selectingStart || !value.startDate) {
            onChange({ startDate: selected, endDate: null });
            setSelectingStart(false);
        } else {
            const startVN = parseDate(value.startDate)!;
            startVN.setHours(8, 0, 0, 0);
            if (selected < startVN) {
                onChange({ startDate: selected, endDate: startVN });
            } else {
                onChange({ startDate: startVN, endDate: selected });
            }
            setSelectingStart(true);
            setIsOpen(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ startDate: null, endDate: null });
        setSelectingStart(true);
    };

    const navigateMonth = (dir: "next" | "prev") => {
        const diff = dir === "next" ? 1 : -1;
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + diff, 1));
    };

    const displayText =
        value.startDate && value.endDate
            ? `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`
            : value.startDate
            ? formatDate(value.startDate)
            : placeholder;

    const days = getDaysInMonth(currentMonth);

    return (
        <div className={cx("date-range-picker")} ref={dropdownRef}>
            <div className={cx("date-input", { disabled })} onClick={() => !disabled && setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={faCalendarAlt} className={cx("calendar-icon")} />
                <span className={cx("date-text", { placeholder: !value.startDate && !value.endDate })}>{displayText}</span>
                {(value.startDate || value.endDate) && (
                    <button type="button" className={cx("clear-button")} onClick={handleClear}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
                <FontAwesomeIcon icon={faChevronDown} className={cx("dropdown-icon", { open: isOpen })} />
            </div>

            {isOpen && (
                <div className={cx("calendar-dropdown")}>
                    <div className={cx("calendar-header")}>
                        <button className={cx("nav-button")} onClick={() => navigateMonth("prev")}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h3 className={cx("month-year")}>
                            Tháng {currentMonth.getMonth() + 1} {currentMonth.getFullYear()}
                        </h3>
                        <button className={cx("nav-button")} onClick={() => navigateMonth("next")}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    <div className={cx("calendar-grid")}>
                        <div className={cx("weekdays")}>
                            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                                <div key={d} className={cx("weekday")}>
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className={cx("days")}>
                            {days.map((date, i) => (
                                <div key={i} className={cx("day-cell")}>
                                    {date && (
                                        <button
                                            type="button"
                                            className={cx("day", {
                                                selected: isSameDay(date, value.startDate) || isSameDay(date, value.endDate),
                                                "in-range": isDateInRange(date),
                                                today: isSameDay(date, today),
                                                disabled: isDateDisabled(date),
                                            })}
                                            onClick={() => handleDateClick(date)}
                                            disabled={isDateDisabled(date)}
                                        >
                                            {date.getDate()}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
