import { DEFAULT_TIME_SCHEDULE } from "./schedule.js";
import { parseTimeToMinutes } from "./time.js";

const DAY_START_MINUTES = 1;
const DAY_END_MINUTES = 23 * 60 + 50;
const DAWN_FRACTION = 0.6;
const DAY_END_FRACTION = 0.9;

export function calculateMeterEnergy(date, schedule = DEFAULT_TIME_SCHEDULE) {
    const validDate = getValidDate(date);

    return getMeterBase(validDate) + getMeterDayFraction(validDate, schedule);
}

export function calculateMeterMonthEnergy(date) {
    const validDate = getValidDate(date);
    return getMeterBase(new Date(validDate.getFullYear(), validDate.getMonth(), 0));
}

export function calculateMeterPreviousDayEnergy(date) {
    const validDate = getValidDate(date);
    const previousDay = new Date(validDate);
    previousDay.setDate(validDate.getDate() - 1);

    return getMeterBase(previousDay);
}

export function formatMeterRegister(date, schedule = DEFAULT_TIME_SCHEDULE) {
    return String(Math.floor(calculateMeterEnergy(date, schedule))).padStart(8, "0").slice(-8);
}

function getMeterBase(date) {
    return Math.floor(date.getFullYear() / 5) + getDayOfYear(date);
}

function getMeterDayFraction(date, schedule) {
    const currentMinutes = getMinutesFromDate(date);
    const dawnMinutes = parseTimeToMinutes(schedule?.automationOff ?? DEFAULT_TIME_SCHEDULE.automationOff);
    const twilightMinutes = parseTimeToMinutes(schedule?.automationOn ?? DEFAULT_TIME_SCHEDULE.automationOn);

    if (currentMinutes <= DAY_START_MINUTES) {
        return 0;
    }

    if (currentMinutes < dawnMinutes) {
        return interpolateFraction(currentMinutes, DAY_START_MINUTES, dawnMinutes, 0, DAWN_FRACTION);
    }

    if (currentMinutes < twilightMinutes) {
        return DAWN_FRACTION;
    }

    if (currentMinutes < DAY_END_MINUTES) {
        return interpolateFraction(currentMinutes, twilightMinutes, DAY_END_MINUTES, DAWN_FRACTION, DAY_END_FRACTION);
    }

    return DAY_END_FRACTION;
}

function interpolateFraction(value, minValue, maxValue, minFraction, maxFraction) {
    if (maxValue <= minValue) {
        return maxFraction;
    }

    const progress = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
    return minFraction + (maxFraction - minFraction) * progress;
}

function getMinutesFromDate(date) {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - startOfYear) / 86400000);
}

function getValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
}
