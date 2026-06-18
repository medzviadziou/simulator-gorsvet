export function parseTimeToMinutes(value) {
    const [hours = "0", minutes = "0"] = String(value).split(":");
    return Number(hours) * 60 + Number(minutes);
}

export function getMinutesFromDate(date) {
    return date.getHours() * 60 + date.getMinutes();
}

export function isTimeInRange(date, startTime, endTime) {
    const currentMinutes = getMinutesFromDate(date);
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes === endMinutes) {
        return false;
    }

    if (startMinutes < endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

export function formatMinutesAsTime(value) {
    const normalizedMinutes = ((Math.round(value) % 1440) + 1440) % 1440;
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDayMonth(date) {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function formatTime(date) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDate(date) {
    return date.toLocaleDateString("ru-RU");
}

export function formatMonthYear(date) {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}
