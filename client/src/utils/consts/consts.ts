export const STEP_ONE = 1;
export const STEP_TWO = 2;
export const STEP_THREE = 3;
export const STEP_FOUR = 4;

export function setLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getLocal(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    return item;
}

export function formatCurrencyVN(amountString) {
    const amount = parseInt(amountString, 10);
    if (isNaN(amount)) {
        return "Không phải số hợp lệ";
    }

    const formatted = new Intl.NumberFormat("vi-VN").format(amount);

    return `${formatted}`;
}

export const formatDateTimeVN = (dateTime) => {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
};

export function formatDateToVietnamese(datetime, daysToAdd = 0) {
    const date = new Date(datetime);

    if (isNaN(date.getTime())) {
        return "Định dạng ngày không hợp lệ";
    }

    date.setDate(date.getDate() + daysToAdd);

    const months = [
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

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `Ngày ${day} ${month} Năm ${year}`;
}

export const convertToDateForDB = (dateString) => {
    const dateParts = dateString.split(" ");
    const day = dateParts[1];
    const month = dateParts[3];
    const year = dateParts[5];

    const formattedDate = new Date(`${year}-${month}-${day}`);

    const dateForDB = formattedDate.toISOString().split("T")[0];

    return dateForDB;
};

export function formatDateFromMilliseconds(milliseconds) {
    const date = new Date(milliseconds);

    const day = date.getDate().toString().padStart(2, "0"); // Đảm bảo 2 chữ số
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0"); // Đảm bảo 2 chữ số
    const minutes = date.getMinutes().toString().padStart(2, "0"); // Đảm bảo 2 chữ số

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function generateTransactionCode() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000);
    return `TX-${timestamp}-${randomNum}`;
}

export function removeLocal(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }

    localStorage.removeItem(key);
}

export function updateWithExpiry(key, value, ttl = "") {
    const itemStr = localStorage.getItem(key);
    if (itemStr) {
        localStorage.removeItem(key);
    }

    setWithExpiry(key, value, ttl);
}

export function setWithExpiry(key, value, ttl) {
    const now = new Date();
    console.log(123);

    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    };

    localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}
