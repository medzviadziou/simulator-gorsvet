import { formatMinutesAsTime } from "./time.js";

const DEG_TO_RAD = Math.PI / 180;
const BELARUS_TIMEZONE_OFFSET_HOURS = 3;

export function calculateCivilTwilightSchedule(date, city) {
    const dayOfYear = getDayOfYear(date);
    const latitude = city.latitude * DEG_TO_RAD;
    const solarDeclination = calculateSolarDeclination(dayOfYear);
    const sunriseSunsetAngle = Math.acos(-Math.tan(latitude) * Math.tan(solarDeclination));
    const civilTwilightAngle = calculateSolarAngle(latitude, solarDeclination, 96);
    const equationOfTimeMinutes = calculateEquationOfTime(dayOfYear);
    const timezoneMeridian = BELARUS_TIMEZONE_OFFSET_HOURS * 15;
    const solarNoonMinutes = 720 - 4 * (city.longitude - timezoneMeridian) - equationOfTimeMinutes;
    const dayHalfMinutes = (sunriseSunsetAngle / DEG_TO_RAD) * 4;
    const civilTwilightMinutes = ((civilTwilightAngle - sunriseSunsetAngle) / DEG_TO_RAD) * 4 * 0.9;

    return {
        turnOn: formatMinutesAsTime(solarNoonMinutes + dayHalfMinutes + civilTwilightMinutes),
        turnOff: formatMinutesAsTime(solarNoonMinutes - dayHalfMinutes - civilTwilightMinutes),
    };
}

function calculateSolarDeclination(dayOfYear) {
    return Math.asin(
        Math.sin(23.45 * DEG_TO_RAD) *
        Math.sin((360 / 365) * (dayOfYear - 81) * DEG_TO_RAD)
    );
}

function calculateSolarAngle(latitude, solarDeclination, solarAngleDegrees) {
    return Math.acos(
        (Math.cos(solarAngleDegrees * DEG_TO_RAD) - Math.sin(latitude) * Math.sin(solarDeclination)) /
        (Math.cos(latitude) * Math.cos(solarDeclination))
    );
}

function calculateEquationOfTime(dayOfYear) {
    const b = (360 / 365) * (dayOfYear - 81) * DEG_TO_RAD;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - startOfYear) / 86400000);
}
