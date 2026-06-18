import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { formatDate, formatTime } from "../../lib/time.js";
import MeterReadingsDialog from "./MeterReadingsDialog.jsx";
import PanelGroup from "./PanelGroup.jsx";
import StatusList from "./StatusList.jsx";
import TimeDialog from "./TimeDialog.jsx";
import { getScadaSignalItems } from "./skadaModel.js";

export default function ScadaRightPanel({ faults, simulatorState, hasPower, virtualTime, timeSchedule, onVirtualTimeChange }) {
    const [isFaultsOpen, setIsFaultsOpen] = useState(true);
    const [isSignalsOpen, setIsSignalsOpen] = useState(true);
    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [isMeterDialogOpen, setIsMeterDialogOpen] = useState(false);
    const now = useFrozenTime(virtualTime, hasPower);
    const signalLevel = useSignalLevel(hasPower);
    const signalItems = getScadaSignalItems(simulatorState, hasPower);

    return (
        <aside className="skada__side skada__side--right">
            <PanelGroup title="Дата/Время" compact externalTitle>
                <div className="skada__time">{formatTime(now)}</div>
                <div className="skada__date">{formatDate(now)}</div>
                <button type="button" onClick={() => setIsTimeDialogOpen(true)}>Установить время</button>
            </PanelGroup>
            {isTimeDialogOpen ? (
                <TimeDialog
                    value={now}
                    onClose={() => setIsTimeDialogOpen(false)}
                    onApply={(nextTime) => {
                        onVirtualTimeChange?.(nextTime);
                        setIsTimeDialogOpen(false);
                    }}
                    onUseSystemTime={() => {
                        onVirtualTimeChange?.(new Date());
                        setIsTimeDialogOpen(false);
                    }}
                />
            ) : null}
            <PanelGroup plain>
                <div className="skada__meter">
                    <span>Уровень сигнала :</span>
                    <span>{hasPower ? signalLevel : "--"}</span>
                </div>
                <button type="button" onClick={() => setIsMeterDialogOpen(true)}>Показания счетчика</button>
            </PanelGroup>
            {isMeterDialogOpen ? (
                <MeterReadingsDialog
                    simulatorState={simulatorState}
                    virtualTime={now}
                    timeSchedule={timeSchedule}
                    hasPower={hasPower}
                    onClose={() => setIsMeterDialogOpen(false)}
                />
            ) : null}
            <PanelGroup
                title="Неисправности"
                marked
                expanded={isFaultsOpen}
                onToggle={() => setIsFaultsOpen((isOpen) => !isOpen)}
            >
                <StatusList items={faults} />
            </PanelGroup>
            <PanelGroup
                title="Сигналы"
                marked
                expanded={isSignalsOpen}
                onToggle={() => setIsSignalsOpen((isOpen) => !isOpen)}
            >
                <ul className="skada__signals">
                    {signalItems.map((item) => (
                        <li key={item.label} className={`skada__signal--${item.state}`}>{item.label}</li>
                    ))}
                </ul>
            </PanelGroup>
        </aside>
    );
}

function useFrozenTime(value, isRunning) {
    const validValue = useMemo(
        () => value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date(0),
        [value]
    );
    const latestRunningTimeRef = useRef(validValue);
    const [frozenTime, freezeTime] = useReducer(replaceValue, validValue);

    useEffect(() => {
        if (isRunning) {
            latestRunningTimeRef.current = validValue;
        }
    }, [isRunning, validValue]);

    useEffect(() => {
        if (!isRunning) {
            freezeTime(latestRunningTimeRef.current);
        }
    }, [isRunning]);

    return isRunning ? validValue : frozenTime;
}

function useSignalLevel(isRunning) {
    const [signalLevel, refreshSignalLevel] = useReducer(createSignalLevel, 26, createSignalLevel);
    const wasRunningRef = useRef(isRunning);

    useEffect(() => {
        if (isRunning && !wasRunningRef.current) {
            refreshSignalLevel();
        }

        wasRunningRef.current = isRunning;
    }, [isRunning]);

    return signalLevel;
}

function createSignalLevel() {
    const randomOffset = Math.floor(Math.random() * 7) - 3;
    return 26 + randomOffset;
}

function replaceValue(_currentValue, nextValue) {
    return nextValue;
}
