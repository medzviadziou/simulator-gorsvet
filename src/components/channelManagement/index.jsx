import "./channelManagement.scss";
import { useEffect, useReducer, useRef } from "react";
import Rele from "../rele/index.jsx";
import Lightning from "../lightning/index.jsx";
import { KEY_MODES } from "../../state/simulatorState.js";

const RELAY_COUNT = 3;
const COMMAND_RELAY_INDEX = 0;
const MANUAL_MODE_RELAY_INDEX = 1;
const REPAIR_MODE_RELAY_INDEX = 2;
const EMPTY_RELAY_STATES = Array(RELAY_COUNT).fill(false);

export default function ChannelManagement({ disabled = false, isControlOn = false, keyMode, relayCommand, onSetKm, onModeChange, onRelayStateChange, isStopHeld = false }) {
    const onSetKmRef = useRef(onSetKm);
    const onModeChangeRef = useRef(onModeChange);
    const onRelayStateChangeRef = useRef(onRelayStateChange);
    const [relayStates, dispatchRelay] = useReducer(relayReducer, EMPTY_RELAY_STATES);
    const isManualModeRelayOn = Boolean(relayStates[MANUAL_MODE_RELAY_INDEX]);
    const hasScheduledCommand = !isManualModeRelayOn && relayCommand?.manualOn === false && typeof relayCommand.commandOn === "boolean";
    const effectiveCommandOn = disabled ? false : hasScheduledCommand ? Boolean(relayCommand.commandOn) : Boolean(relayStates[COMMAND_RELAY_INDEX]);
    const displayedRelayStates = disabled ? EMPTY_RELAY_STATES : relayStates;
    const indicatorRelayStates = getIndicatorRelayStates({
        disabled,
        relayStates,
        hasScheduledCommand,
        scheduledCommandOn: relayCommand?.commandOn,
    });
    const mainIndicatorState = getControlIndicatorState({ disabled, isControlOn: !disabled && isControlOn });

    useEffect(() => {
        onSetKmRef.current = onSetKm;
    }, [onSetKm]);

    useEffect(() => {
        onModeChangeRef.current = onModeChange;
    }, [onModeChange]);

    useEffect(() => {
        onRelayStateChangeRef.current = onRelayStateChange;
    }, [onRelayStateChange]);

    useEffect(() => {
        if (!relayCommand) {
            return undefined;
        }

        dispatchRelay({ type: "applyCommand", relayCommand });
        return undefined;
    }, [relayCommand]);

    useEffect(() => {
        if (!disabled) {
            return undefined;
        }

        dispatchRelay({ type: "reset" });
        return undefined;
    }, [disabled]);

    useEffect(() => {
        const isAutoMode = keyMode === KEY_MODES.AUTO;

        if (disabled || !isAutoMode) {
            return undefined;
        }

        if (isStopHeld) {
            onSetKmRef.current?.(false);
            return undefined;
        }

        onSetKmRef.current?.(effectiveCommandOn);
        return undefined;
    }, [effectiveCommandOn, disabled, keyMode, isStopHeld]);

    useEffect(() => {
        onModeChangeRef.current?.(!relayStates[MANUAL_MODE_RELAY_INDEX]);
    }, [relayStates]);

    useEffect(() => {
        onRelayStateChangeRef.current?.({
            commandOn: effectiveCommandOn,
            manualOn: Boolean(relayStates[MANUAL_MODE_RELAY_INDEX]),
        });
    }, [effectiveCommandOn, relayStates]);

    const handleRelayChange = (index, isChecked) => {
        dispatchRelay({ type: "setRelay", index, value: isChecked });
    };

    return (
        <div className={`channel ${disabled ? "channel--disabled" : ""}`}>
            <div className="channel__control-title">Контроль</div>
            <div className="channel__management-title">Управление</div>

            <div className="channel__main-indicator">
                <Lightning state={mainIndicatorState} />
            </div>

            <div className="channel__lights">
                {indicatorRelayStates.map((isRelayIndicatorOn, index) => (
                    <Lightning
                        key={index}
                        state={getRelayIndicatorState({ disabled, index, isRelayIndicatorOn })}
                    />
                ))}
            </div>

            <div className="channel__reles">
                {displayedRelayStates.map((isRelayOn, index) => (
                    <Rele
                        key={index}
                        disabled={disabled || index === REPAIR_MODE_RELAY_INDEX}
                        checked={isRelayOn}
                        onChange={(isChecked) => handleRelayChange(index, isChecked)}
                    />
                ))}
            </div>

            <div className="channel__labels">
                <div className="channel__label channel__label--strong">Команда</div>
                <div className="channel__label">
                    Ручное управление
                    <br />
                    Автоматическое управление
                </div>
                <div className="channel__label channel__label--strong">Режим ремонта</div>
            </div>
        </div>
    );
}

function relayReducer(states, action) {
    switch (action.type) {
        case "applyCommand":
            return applyRelayCommand(states, action.relayCommand);
        case "reset":
            return areStatesEqual(states, EMPTY_RELAY_STATES) ? states : EMPTY_RELAY_STATES;
        case "setRelay":
            return updateStateAt(states, action.index, action.value);
        default:
            return states;
    }
}

function applyRelayCommand(states, relayCommand) {
    const nextStates = [...states];

    if (typeof relayCommand.commandOn === "boolean" && relayCommand.manualOn !== false) {
        nextStates[COMMAND_RELAY_INDEX] = relayCommand.commandOn;
    }

    if (typeof relayCommand.manualOn === "boolean") {
        nextStates[MANUAL_MODE_RELAY_INDEX] = relayCommand.manualOn;
    }

    return areStatesEqual(states, nextStates) ? states : nextStates;
}

function updateStateAt(states, index, value) {
    return states.map((state, stateIndex) => (stateIndex === index ? value : state));
}

function areStatesEqual(leftStates, rightStates) {
    return leftStates.length === rightStates.length && leftStates.every((state, index) => state === rightStates[index]);
}

function getIndicatorRelayStates({ disabled, relayStates, hasScheduledCommand, scheduledCommandOn }) {
    if (disabled) {
        return EMPTY_RELAY_STATES;
    }

    const nextStates = [...relayStates];

    if (hasScheduledCommand) {
        nextStates[COMMAND_RELAY_INDEX] = Boolean(scheduledCommandOn);
    }

    return nextStates;
}

function getRelayIndicatorState({ disabled, index, isRelayIndicatorOn }) {
    if (disabled || index === REPAIR_MODE_RELAY_INDEX) {
        return "default";
    }

    return isRelayIndicatorOn ? "on" : "off";
}

function getControlIndicatorState({ disabled, isControlOn }) {
    if (disabled) {
        return "default";
    }

    return isControlOn ? "on" : "off";
}
