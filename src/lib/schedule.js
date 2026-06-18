import { addMinutes, isTimeInRange, parseTimeToMinutes } from "./time.js";

export const DEFAULT_TIME_SCHEDULE = {
    automationOn: "18:00",
    automationOff: "06:00",
    economyOn: "23:30",
    economyOff: "05:30",
};

export function getScheduledCommands(date, schedule = DEFAULT_TIME_SCHEDULE) {
    const automationActive = isTimeInRange(date, schedule.automationOn, schedule.automationOff);
    const economyActive = isTimeInRange(date, schedule.economyOn, schedule.economyOff);

    return {
        km1: automationActive,
        km2: automationActive && !economyActive,
        km3: false,
    };
}

export function getStreetSceneId(date, schedule = DEFAULT_TIME_SCHEDULE) {
    const currentDate = getValidDate(date);
    const automationOn = parseTimeToMinutes(schedule.automationOn ?? DEFAULT_TIME_SCHEDULE.automationOn);
    const automationOff = parseTimeToMinutes(schedule.automationOff ?? DEFAULT_TIME_SCHEDULE.automationOff);
    const events = [];

    for (let dayOffset = -1; dayOffset <= 1; dayOffset += 1) {
        const baseDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + dayOffset
        );
        const onDate = addMinutes(baseDate, automationOn);
        const offDate = addMinutes(baseDate, automationOff + (automationOff <= automationOn ? 1440 : 0));

        events.push(
            { at: addMinutes(onDate, -15), sceneId: "sunset" },
            { at: addMinutes(onDate, -3), sceneId: "evening" },
            { at: addMinutes(onDate, 5), sceneId: "night" },
            { at: addMinutes(offDate, -5), sceneId: "morning" },
            { at: addMinutes(offDate, 3), sceneId: "dawn" },
            { at: addMinutes(offDate, 10), sceneId: "day" },
        );
    }

    const currentTime = currentDate.getTime();
    return events
        .filter((event) => event.at.getTime() <= currentTime)
        .sort((left, right) => right.at.getTime() - left.at.getTime())[0]?.sceneId ?? "day";
}

function getValidDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    return new Date();
}
