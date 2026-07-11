export function formatDateTime(dateTime) {
    if (!dateTime) {
        return "";
    }

    // SQLite 형식: "2026-07-11 02:30:00"
    // UTC임을 명확히 나타내기 위해 ISO 형식으로 변환
    const utcDateTime = dateTime.includes("T")
        ? dateTime
        : `${dateTime.replace(" ", "T")}Z`;

    const date = new Date(utcDateTime);

    if (Number.isNaN(date.getTime())) {
        return dateTime;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
}