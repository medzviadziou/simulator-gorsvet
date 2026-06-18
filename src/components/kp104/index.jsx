import "./kp104.scss";
import { KEY_MODES } from "../../state/simulatorState.js";

function canStart(simulatorState) {
    return simulatorState.qs1 && simulatorState.keyMode === KEY_MODES.MANUAL;
}

export default function Kp104({ simulatorState, dispatch, actions, disabled = false, onStopHoldChange }) {
    const startAllowed = !disabled && canStart(simulatorState);
    const kmActions = {
        km1: actions.setKm1,
        km2: actions.setKm2,
        km3: actions.setKm3,
    };

    const handleStart = (kmName) => {
        if (!startAllowed) {
            return;
        }
        dispatch(kmActions[kmName](true));
    };

    const handleStop = (kmName) => {
        if (disabled) {
            return;
        }
        dispatch(kmActions[kmName](false));
    };

    const handleStopHold = (kmName, isHeld) => {
        onStopHoldChange?.(kmName, isHeld);
    };

    const handleToggleKeyMode = () => {
        const nextMode = simulatorState.keyMode === KEY_MODES.MANUAL ? KEY_MODES.AUTO : KEY_MODES.MANUAL;
        dispatch(actions.setKeyMode(nextMode));
        dispatch(actions.setKm1(false));
        dispatch(actions.setKm2(false));
        dispatch(actions.setKm3(false));
    };

    return (
        <div className={`kp104 ${disabled ? "kp104--disabled" : ""}`}>
            <span className="kp104__screw kp104__screw--top-left" />
            <span className="kp104__screw kp104__screw--top-right" />
            <span className="kp104__screw kp104__screw--bottom-left" />
            <span className="kp104__screw kp104__screw--bottom-right" />
            <span className="kp104__mark" />

            <div className="kp104__content">
                <ControlGroup
                    title="KM1"
                    active={simulatorState.km1}
                    startAllowed={startAllowed}
                    disabled={disabled}
                    onStart={() => handleStart("km1")}
                    onStop={() => handleStop("km1")}
                    onStopHoldChange={(isHeld) => handleStopHold("km1", isHeld)}
                />
                <ControlGroup
                    title="KM2"
                    active={simulatorState.km2}
                    startAllowed={startAllowed}
                    disabled={disabled}
                    onStart={() => handleStart("km2")}
                    onStop={() => handleStop("km2")}
                    onStopHoldChange={(isHeld) => handleStopHold("km2", isHeld)}
                />

                <button
                    type="button"
                    className={`kp104__key ${simulatorState.keyMode === KEY_MODES.AUTO ? "kp104__key--auto" : ""}`}
                    onClick={handleToggleKeyMode}
                    aria-label="Переключить режим ключа"
                >
                    <span className="kp104__key-slot" />
                </button>
                <div className="kp104__mode-labels" aria-hidden="true">
                    <span className={`kp104__mode-label ${simulatorState.keyMode === KEY_MODES.MANUAL ? "kp104__mode-label--active" : ""}`}>Р</span>
                    <span className={`kp104__mode-label ${simulatorState.keyMode === KEY_MODES.AUTO ? "kp104__mode-label--active" : ""}`}>А</span>
                </div>

                <ControlGroup
                    title="KM3"
                    active={simulatorState.km3}
                    startAllowed={startAllowed}
                    disabled={disabled}
                    onStart={() => handleStart("km3")}
                    onStop={() => handleStop("km3")}
                    onStopHoldChange={(isHeld) => handleStopHold("km3", isHeld)}
                />
            </div>
        </div>
    );
}

function ControlGroup({ title, active, startAllowed, disabled, onStart, onStop, onStopHoldChange }) {
    const handleStopDown = () => {
        if (disabled) {
            return;
        }
        onStopHoldChange?.(true);
        onStop();
    };

    const handleStopUp = () => {
        onStopHoldChange?.(false);
    };

    return (
        <div className="kp104__group">
            <button
                type="button"
                className="kp104__button kp104__button--green"
                onClick={onStart}
                aria-label={`${title} пуск`}
                aria-disabled={!startAllowed}
            />
            <div className={`kp104__indicator ${active ? "kp104__indicator--on" : ""}`} />
            <button
                type="button"
                className="kp104__button kp104__button--red"
                onPointerDown={handleStopDown}
                onPointerUp={handleStopUp}
                onPointerCancel={handleStopUp}
                onPointerLeave={handleStopUp}
                aria-label={`${title} стоп`}
                aria-disabled={disabled}
            >
                <span className="kp104__button-circle" />
            </button>
        </div>
    );
}
