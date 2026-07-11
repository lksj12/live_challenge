export function formatStudyTime(totalMinutes) {
    const safeMinutes = Number(totalMinutes) || 0;
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;

    if (hours === 0) {
        return `${minutes}분`;
    }

    if (minutes === 0) {
        return `${hours}시간`;
    }

    return `${hours}시간 ${minutes}분`;
}