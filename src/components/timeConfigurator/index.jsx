import "./timeConfigurator.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { BELARUS_DISTRICT_CITIES, DEFAULT_CITY_NAME } from "../../data/belarusCities.js";
import { calculateCivilTwilightSchedule } from "../../lib/solarTime.js";
import { formatDayMonth } from "../../lib/time.js";

const DEFAULT_TIME_VALUES = {
    economyOn: "23:30",
    economyOff: "05:30",
};

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0"));

export default function TimeConfigurator({ currentTime, onCurrentTimeChange, onScheduleChange }) {
    const [timeValues, setTimeValues] = useState(DEFAULT_TIME_VALUES);
    const [cityName, setCityName] = useState(DEFAULT_CITY_NAME);
    const [isSimulationFast, setIsSimulationFast] = useState(false);
    const lastTickRef = useRef(null);
    const simulatedDateLabel = formatDayMonth(currentTime);
    const selectedCity = useMemo(
        () => BELARUS_DISTRICT_CITIES.find((city) => city.name === cityName) ?? BELARUS_DISTRICT_CITIES[0],
        [cityName]
    );
    const civilTwilightSchedule = useMemo(
        () => calculateCivilTwilightSchedule(currentTime, selectedCity),
        [currentTime, selectedCity]
    );

    useEffect(() => {
        lastTickRef.current = Date.now();

        const timerId = window.setInterval(() => {
            const nowMs = Date.now();
            const elapsedMs = nowMs - lastTickRef.current;
            lastTickRef.current = nowMs;
            const timeScale = isSimulationFast ? 60 : 1;

            onCurrentTimeChange((time) => new Date(time.getTime() + elapsedMs * timeScale));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [isSimulationFast, onCurrentTimeChange]);

    useEffect(() => {
        onScheduleChange?.({
            automationOn: civilTwilightSchedule.turnOn,
            automationOff: civilTwilightSchedule.turnOff,
            economyOn: timeValues.economyOn,
            economyOff: timeValues.economyOff,
        });
    }, [civilTwilightSchedule.turnOn, civilTwilightSchedule.turnOff, timeValues.economyOn, timeValues.economyOff, onScheduleChange]);

    const handleTimeChange = (name, value) => {
        setTimeValues((values) => ({
            ...values,
            [name]: value,
        }));
    };

    return (
        <section className="time-config">
            <div className="time-config__schedule">
                <div className="time-config__city">
                    <div className="time-config__nowrap">
                        <span>
                            Расчетное время включения автоматики
                            <br />
                            по гражданским сумеркам (примерное) для города
                        </span>
                        <select
                            id="time-config-city"
                            name="timeConfigCity"
                            value={cityName}
                            onChange={(event) => setCityName(event.target.value)}
                        >
                            {BELARUS_DISTRICT_CITIES.map((city) => (
                                <option key={city.name} value={city.name}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <label className="time-config__city-check">
                        <input
                            id="time-config-fast-mode"
                            name="timeConfigFastMode"
                            type="checkbox"
                            checked={isSimulationFast}
                            onChange={(event) => setIsSimulationFast(event.target.checked)}
                        />
                        <span className="time-config__custom-check" aria-hidden="true" />
                        <span>Ускорить течение времени</span>
                    </label>
                </div>

                <div className="time-config__time-column">
                    <TimeField
                        label={`Время авто откл. ${simulatedDateLabel}`}
                        value={civilTwilightSchedule.turnOff}
                        readOnly
                    />
                    <TimeField
                        label={`Время авто вкл. ${simulatedDateLabel}`}
                        value={civilTwilightSchedule.turnOn}
                        readOnly
                    />
                </div>

                <div className="time-config__time-column">
                    <TimeField
                        label="Экономия с:"
                        name="economyOn"
                        value={timeValues.economyOn}
                        onChange={handleTimeChange}
                    />
                    <TimeField
                        label="Экономия по:"
                        name="economyOff"
                        value={timeValues.economyOff}
                        onChange={handleTimeChange}
                    />
                </div>
            </div>
        </section>
    );
}

function TimeField({ label, name, value, onChange, readOnly = false }) {
    const fieldRef = useRef(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [hours, minutes] = value.split(":");

    useEffect(() => {
        if (!isPickerOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!fieldRef.current?.contains(event.target)) {
                setIsPickerOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsPickerOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPickerOpen]);

    const updateTime = (nextHours, nextMinutes, shouldClose = false) => {
        onChange?.(name, `${nextHours}:${nextMinutes}`);

        if (shouldClose) {
            setIsPickerOpen(false);
        }
    };

    return (
        <div className="time-config__field" ref={fieldRef}>
            <span>{label}</span>
            {readOnly ? (
                <span className="time-config__time-display" aria-label={label}>
                    {value}
                </span>
            ) : (
                <>
                    <button
                        type="button"
                        className="time-config__time-picker"
                        aria-expanded={isPickerOpen}
                        onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
                    >
                        <span className="time-config__time-picker-value">{value}</span>
                    </button>
                    {isPickerOpen ? (
                        <div className="time-config__time-popover">
                            <select
                                id={`${name}-hours`}
                                name={`${name}Hours`}
                                value={hours}
                                aria-label={`${label}: часы`}
                                onChange={(event) => updateTime(event.target.value, minutes)}
                            >
                                {HOURS.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                id={`${name}-minutes`}
                                name={`${name}Minutes`}
                                value={minutes}
                                aria-label={`${label}: минуты`}
                                onChange={(event) => updateTime(hours, event.target.value, true)}
                            >
                                {MINUTES.map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
