import { useState } from "react";
import { formatMonthYear } from "../../lib/time.js";

export default function TimeDialog({ value, onApply, onUseSystemTime, onClose }) {
    const [selectedDate, setSelectedDate] = useState(() => new Date(value));
    const [viewDate, setViewDate] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
    const [timeParts, setTimeParts] = useState(() => ({
        hours: value.getHours(),
        minutes: value.getMinutes(),
        seconds: value.getSeconds(),
    }));
    const calendarDays = getCalendarDays(viewDate);

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextTime = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            timeParts.hours,
            timeParts.minutes,
            timeParts.seconds,
        );

        if (!Number.isNaN(nextTime.getTime())) {
            onApply?.(nextTime);
        }
    };

    const changeMonth = (offset) => {
        setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + offset, 1));
    };

    const changeTimePart = (name, offset) => {
        const maxValues = {
            hours: 23,
            minutes: 59,
            seconds: 59,
        };

        setTimeParts((parts) => {
            const max = maxValues[name];
            const nextValue = (parts[name] + offset + max + 1) % (max + 1);
            return {
                ...parts,
                [name]: nextValue,
            };
        });
    };

    return (
        <div className="skada__modal-backdrop" role="presentation" onMouseDown={onClose}>
            <form className="skada__time-dialog" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
                <div className="skada__time-dialog-accent" />
                <div className="skada__time-dialog-title">Синхронизация времени</div>

                <div className="skada__time-dialog-content">
                    <section className="skada__calendar">
                        <div className="skada__time-dialog-subtitle">Дата</div>
                        <div className="skada__calendar-box">
                            <div className="skada__calendar-header">
                                <button type="button" onClick={() => changeMonth(-1)} aria-label="Предыдущий месяц">‹</button>
                                <span>{formatMonthYear(viewDate)}</span>
                                <button type="button" onClick={() => changeMonth(1)} aria-label="Следующий месяц">›</button>
                            </div>
                            <div className="skada__calendar-weekdays">
                                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                                    <span key={day}>{day}</span>
                                ))}
                            </div>
                            <div className="skada__calendar-grid">
                                {calendarDays.map((day) => {
                                    const isSelected = isSameDate(day.date, selectedDate);
                                    return (
                                        <button
                                            key={day.date.toISOString()}
                                            type="button"
                                            className={`${!day.currentMonth ? "skada__calendar-day--muted" : ""} ${isSelected ? "skada__calendar-day--selected" : ""}`.trim()}
                                            onClick={() => setSelectedDate(day.date)}
                                        >
                                            {day.date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="skada__time-spinner-group">
                        <div className="skada__time-dialog-subtitle">Время</div>
                        <div className="skada__time-spinners">
                            <TimeSpinner label="Часы" value={timeParts.hours} onUp={() => changeTimePart("hours", 1)} onDown={() => changeTimePart("hours", -1)} />
                            <span className="skada__time-separator">:</span>
                            <TimeSpinner label="Минуты" value={timeParts.minutes} onUp={() => changeTimePart("minutes", 1)} onDown={() => changeTimePart("minutes", -1)} />
                            <span className="skada__time-separator">:</span>
                            <TimeSpinner label="Секунды" value={timeParts.seconds} onUp={() => changeTimePart("seconds", 1)} onDown={() => changeTimePart("seconds", -1)} />
                        </div>
                    </section>
                </div>

                <div className="skada__time-dialog-actions">
                    <button type="button" onClick={onUseSystemTime}>Системное время</button>
                    <button type="submit">Применить</button>
                    <button type="button" onClick={onClose}>Отмена</button>
                </div>
            </form>
        </div>
    );
}

function TimeSpinner({ label, value, onUp, onDown }) {
    return (
        <div className="skada__time-spinner" aria-label={label}>
            <button type="button" onClick={onUp}>+</button>
            <div>{String(value).padStart(2, "0")}</div>
            <button type="button" onClick={onDown}>-</button>
        </div>
    );
}

function getCalendarDays(viewDate) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const startDate = new Date(year, month, 1 - firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);

        return {
            date,
            currentMonth: date.getMonth() === month,
        };
    });
}

function isSameDate(left, right) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}
