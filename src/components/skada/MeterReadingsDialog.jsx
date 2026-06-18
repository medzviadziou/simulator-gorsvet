import { useEffect, useMemo, useState } from "react";
import {
    calculateMeterEnergy,
    calculateMeterMonthEnergy,
    calculateMeterPreviousDayEnergy,
} from "../../lib/meterReadings.js";

const VOLTAGE_MIN = 222.2;
const VOLTAGE_MAX = 237.6;

export default function MeterReadingsDialog({ simulatorState, virtualTime, timeSchedule, hasPower, onClose }) {
    const [voltageState, setVoltageState] = useState(() => ({
        hasPower,
        value: createVoltageSet(hasPower),
    }));
    const date = useMemo(() => getValidDate(virtualTime), [virtualTime]);
    const voltage = voltageState.value;
    const power = useMemo(
        () => calculatePower(simulatorState, hasPower),
        [simulatorState, hasPower]
    );
    const current = useMemo(
        () => calculateCurrent(power, voltage),
        [power, voltage]
    );
    const energy = useMemo(() => ({
        current: calculateMeterEnergy(date, timeSchedule),
        month: calculateMeterMonthEnergy(date),
        day: calculateMeterPreviousDayEnergy(date),
    }), [date, timeSchedule]);

    if (voltageState.hasPower !== hasPower) {
        setVoltageState({
            hasPower,
            value: createVoltageSet(hasPower),
        });
    }

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setVoltageState({
                hasPower,
                value: createVoltageSet(hasPower),
            });
        }, 10000);

        return () => window.clearInterval(timerId);
    }, [hasPower]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="skada__modal-backdrop skada__modal-backdrop--meter" onMouseDown={onClose}>
            <div className="skada__meter-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                <div className="skada__meter-dialog-title">Показания</div>

                <MeterSection rows={[
                    ["Дата :", formatMeterDate(date)],
                    ["Время :", formatMeterTime(date)],
                ]} />

                <MeterSection title="Напряжение, В :" rows={[
                    ["Ua =", formatDecimal(voltage.a)],
                    ["Ub =", formatDecimal(voltage.b)],
                    ["Uc =", formatDecimal(voltage.c)],
                ]} />

                <MeterSection title="Ток, А :" rows={[
                    ["Ia =", formatDecimal(current.a)],
                    ["Ib =", formatDecimal(current.b)],
                    ["Ic =", formatDecimal(current.c)],
                ]} />

                <MeterSection title="Мощность, кВт :" rows={[
                    ["Pa =", formatDecimal(power.a)],
                    ["Pb =", formatDecimal(power.b)],
                    ["Pc =", formatDecimal(power.c)],
                ]} />

                <MeterSection title="Энергия, кВт*ч :" rows={[
                    ["E      =", formatEnergy(energy.current)],
                    ["E м =", formatEnergy(energy.month)],
                    ["E д =", formatEnergy(energy.day)],
                ]} />
            </div>
        </div>
    );
}

function MeterSection({ title, rows }) {
    return (
        <section className={`skada__meter-section ${title ? "" : "skada__meter-section--compact"}`}>
            {title ? <div className="skada__meter-section-title">{title}</div> : null}
            <div className="skada__meter-section-rows">
                {rows.map(([label, value]) => (
                    <div className="skada__meter-row" key={label}>
                        <span>{label}</span>
                        <span>{value}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function createVoltageSet(hasPower) {
    if (!hasPower) {
        return { a: 0, b: 0, c: 0 };
    }

    return {
        a: randomVoltage(),
        b: randomVoltage(),
        c: randomVoltage(),
    };
}

function randomVoltage() {
    return Number((VOLTAGE_MIN + Math.random() * (VOLTAGE_MAX - VOLTAGE_MIN)).toFixed(1));
}

function calculatePower(simulatorState, hasPower) {
    const isPowered = (sfName, kmName) => Boolean(hasPower && simulatorState?.[kmName] && simulatorState?.sf?.[sfName]);

    return {
        a: (isPowered("sf4", "km1") ? 1.2 : 0) + (isPowered("sf8", "km2") ? 1.4 : 0),
        b: (isPowered("sf5", "km2") ? 1.4 : 0) + (isPowered("sf7", "km1") ? 1.3 : 0),
        c: 0.1 + (isPowered("sf6", "km2") ? 1.1 : 0) + (isPowered("sf9", "km2") ? 1.1 : 0) + (isPowered("sf10", "km3") ? 0.3 : 0),
    };
}

function calculateCurrent(power, voltage) {
    return {
        a: phaseCurrent(power.a, voltage.a),
        b: phaseCurrent(power.b, voltage.b),
        c: phaseCurrent(power.c, voltage.c),
    };
}

function phaseCurrent(powerKw, voltageValue) {
    if (!voltageValue) {
        return 0;
    }

    return Number(((powerKw * 1000) / voltageValue).toFixed(1));
}

function getValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
}

function formatMeterDate(date) {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}

function formatMeterTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

function formatDecimal(value) {
    return value.toFixed(1).replace(".", ",");
}

function formatEnergy(value) {
    return value.toFixed(1).replace(".", ",");
}
