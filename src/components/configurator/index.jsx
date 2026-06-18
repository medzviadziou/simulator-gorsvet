import "./configurator.scss";
import { useMemo } from "react";
import ChannelManagement from "../channelManagement/index.jsx";
import Lightning from "../lightning/index.jsx";
import Alarm from "../alarm/index.jsx";
import TimeConfigurator from "../timeConfigurator/index.jsx";
import { KEY_MODES } from "../../state/simulatorState.js";

const KM_ACTIONS = {
    km1: "setKm1",
    km2: "setKm2",
    km3: "setKm3",
};

const DISCRETE_COUNT = 11;
export default function Configurator({ simulatorState, virtualTime, setVirtualTime, onTimeScheduleChange, dispatch, actions, channelRelayCommands = {}, onChannelModeChange, onChannelRelayStateChange, kmStopHold = {}, channelRelayStates = {} }) {
    const displayedKmStates = useDelayedKmStates(simulatorState);
    const displayedFeederStates = useDelayedFeederStates(simulatorState);
    const hasPower = useDelayedConfiguratorPower(Boolean(simulatorState?.qs1 && simulatorState?.sf?.sf1));
    const disabled = !hasPower;
    const indicatorState = hasPower ? "off" : "default";
    const isSecurityFault = hasPower && (!simulatorState?.sf?.sf2 || !simulatorState?.mpPressed);
    const isControlCircuitFault = hasPower && (simulatorState?.keyMode !== KEY_MODES.AUTO || !simulatorState?.sf?.sf2);
    const channelControlFaults = getChannelControlFaults({ hasPower, simulatorState, channelRelayStates });
    const hasControlFault = Object.values(channelControlFaults).some(Boolean);
    const fuseFaults = getFuseFaults({ hasPower, simulatorState, displayedFeederStates });
    const isFuseFault = Object.values(fuseFaults).some(Boolean);
    const normalFaultValue = hasPower ? false : undefined;
    const startErrorValues = Array(8).fill(normalFaultValue);
    if (hasPower) {
        startErrorValues[0] = channelControlFaults.km1;
        startErrorValues[1] = channelControlFaults.km2;
        startErrorValues[2] = channelControlFaults.km3;
    }
    const fuseErrorValues = getFuseErrorValues({ hasPower, fuseFaults });
    const securityFaultValue = hasPower ? isSecurityFault : undefined;
    const controlCircuitFaultValue = hasPower ? isControlCircuitFault : undefined;
    const controlFaultValue = hasPower ? hasControlFault : undefined;
    const fuseFaultValue = hasPower ? isFuseFault : undefined;
    const module1StateIndicators = getModule1StateIndicators({ hasPower, simulatorState, displayedKmStates, displayedFeederStates, defaultState: indicatorState });
    const module1FaultIndicators = getModule1FaultIndicators({ hasPower, simulatorState, fuseFaults, defaultState: indicatorState });

    return (
        <div className={`configurator ${disabled ? "configurator--disabled" : ""}`}>
            <div className="configurator__column">
                <div className="configurator__panel">
                    <div className="configurator__panel-title">Неисправности</div>
                    <div className="configurator__fault-list">
                        <Fault text="Нет питания" value={normalFaultValue} />
                        <Fault text="Неисправность цепи управления" value={controlCircuitFaultValue} />
                        <Fault text="Неисправность охраны" value={securityFaultValue} />
                        <Fault text="Неисправность управления" value={controlFaultValue} />
                        <Fault text="Неисправность предохранителей" value={fuseFaultValue} />
                    </div>
                </div>

                <div className="configurator__panel">
                    <div className="configurator__panel-title">Ошибки включения</div>
                    <div className="configurator__fault-list configurator__fault-list--grid">
                        {startErrorValues.map((value, i) => (
                            <Fault key={i} text={`Канал №${i + 1}`} value={value} />
                        ))}
                    </div>
                </div>

                <div className="configurator__panel">
                    <div className="configurator__panel-title">Ошибки предохранителей</div>
                    <div className="configurator__fault-list configurator__fault-list--grid">
                        {fuseErrorValues.map((value, i) => (
                            <Fault key={i} text={`Канал №${i + 1}`} value={value} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="configurator__column">
                <div className="configurator__panel">
                    <div className="configurator__panel-title">Контроль каналов управления</div>
                    <div className="configurator__channels">
                        <div className="configurator__channel-panel">
                            <div className="configurator__panel-title">Канал №1</div>
                            <ChannelBlock disabled={disabled} simulatorState={simulatorState} dispatch={dispatch} actions={actions} kmName="km1" relayCommand={channelRelayCommands.km1} onChannelModeChange={onChannelModeChange} onChannelRelayStateChange={onChannelRelayStateChange} isStopHeld={kmStopHold.km1} />
                        </div>
                        <div className="configurator__channel-panel">
                            <div className="configurator__panel-title">Канал №2</div>
                            <ChannelBlock disabled={disabled} simulatorState={simulatorState} dispatch={dispatch} actions={actions} kmName="km2" relayCommand={channelRelayCommands.km2} onChannelModeChange={onChannelModeChange} onChannelRelayStateChange={onChannelRelayStateChange} isStopHeld={kmStopHold.km2} />
                        </div>
                        <div className="configurator__channel-panel">
                            <div className="configurator__panel-title">Канал №3</div>
                            <ChannelBlock disabled={disabled} simulatorState={simulatorState} dispatch={dispatch} actions={actions} kmName="km3" relayCommand={channelRelayCommands.km3} onChannelModeChange={onChannelModeChange} onChannelRelayStateChange={onChannelRelayStateChange} isStopHeld={kmStopHold.km3} />
                        </div>
                    </div>
                </div>

                <div className="configurator__panel">
                    <div className="configurator__panel-title">Индикация состояния</div>

                    <div className="configurator__module configurator__panel">
                        <div className="configurator__panel-title">Дискретный модуль №1</div>

                        <div className="configurator__module-grid">
                            <div className="configurator__module-row">
                                <span>Состояние</span>
                                {module1StateIndicators.map((state, i) => (
                                    <div key={`state-${i}`}>
                                        <span className="configurator__module-number">{i + 1}</span>
                                        <Lightning state={state} />
                                    </div>
                                ))}
                            </div>

                            <div className="configurator__module-row">
                                <span>Неисправность</span>
                                {module1FaultIndicators.map((state, i) => (
                                    <Lightning key={`fault-${i}`} state={state} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <TimeConfigurator currentTime={virtualTime} onCurrentTimeChange={setVirtualTime} onScheduleChange={onTimeScheduleChange} />
            </div>
        </div>
    );
}

function Fault({ text, value }) {
    return (
        <div className="configurator__fault">
            <Alarm value={value} />
            <span>{text}</span>
        </div>
    );
}

function ChannelBlock({ disabled, simulatorState, dispatch, actions, kmName, relayCommand, onChannelModeChange, onChannelRelayStateChange, isStopHeld = false }) {
    const setKmAction = actions?.[KM_ACTIONS[kmName]];

    return (
        <div className="configurator__channel-block">
            <ChannelManagement
                disabled={disabled}
                keyMode={simulatorState?.keyMode}
                isControlOn={simulatorState?.[kmName]}
                relayCommand={relayCommand}
                onSetKm={(value) => {
                    if (setKmAction) {
                        dispatch(setKmAction(value));
                    }
                }}
                onModeChange={(isAutoMode) => onChannelModeChange?.(kmName, isAutoMode)}
                onRelayStateChange={(nextRelayState) => onChannelRelayStateChange?.(kmName, nextRelayState)}
                isStopHeld={isStopHeld}
            />
        </div>
    );
}

function getModule1StateIndicators({ hasPower, simulatorState, displayedKmStates, displayedFeederStates, defaultState }) {
    const states = Array(DISCRETE_COUNT).fill(defaultState);
    const sf2On = Boolean(simulatorState?.sf?.sf2);
    const kp104Auto = simulatorState?.keyMode === KEY_MODES.AUTO;

    if (!hasPower) {
        states[0] = "default";
        states[1] = "default";
        return states;
    }

    states[0] = sf2On && simulatorState?.mpPressed ? "on" : "off";
    states[1] = kp104Auto && sf2On ? "on" : "off";
    states[2] = displayedKmStates.km1 ? "on" : "off";
    states[3] = displayedKmStates.km2 ? "on" : "off";
    states[4] = displayedKmStates.km3 ? "on" : "off";
    states[5] = displayedFeederStates.state6 ? "on" : "off";
    states[6] = displayedFeederStates.state7 ? "on" : "off";
    states[7] = displayedFeederStates.state8 ? "on" : "off";
    states[8] = displayedFeederStates.state9 ? "on" : "off";
    states[9] = displayedFeederStates.state10 ? "on" : "off";
    states[10] = displayedFeederStates.state11 ? "on" : "off";
    return states;
}

function getModule1FaultIndicators({ hasPower, simulatorState, fuseFaults, defaultState }) {
    const states = Array(DISCRETE_COUNT).fill(defaultState);
    const sf2On = Boolean(simulatorState?.sf?.sf2);
    const kp104Auto = simulatorState?.keyMode === KEY_MODES.AUTO;

    if (!hasPower) {
        states[0] = "default";
        states[1] = "default";
        return states;
    }

    states[0] = sf2On && simulatorState?.mpPressed ? "off" : "on";
    states[1] = kp104Auto && sf2On ? "off" : "on";
    states[5] = fuseFaults.state6 ? "on" : "off";
    states[6] = fuseFaults.state7 ? "on" : "off";
    states[7] = fuseFaults.state8 ? "on" : "off";
    states[8] = fuseFaults.state9 ? "on" : "off";
    states[9] = fuseFaults.state10 ? "on" : "off";
    states[10] = fuseFaults.state11 ? "on" : "off";
    return states;
}

function getFuseFaults({ hasPower, simulatorState, displayedFeederStates }) {
    if (!hasPower) {
        return {
            state6: false,
            state7: false,
            state8: false,
            state9: false,
            state10: false,
            state11: false,
        };
    }

    return {
        state6: Boolean(simulatorState?.km1 && !displayedFeederStates.state6),
        state7: Boolean(simulatorState?.km2 && !displayedFeederStates.state7),
        state8: Boolean(simulatorState?.km2 && !displayedFeederStates.state8),
        state9: Boolean(simulatorState?.km1 && !displayedFeederStates.state9),
        state10: Boolean(simulatorState?.km2 && !displayedFeederStates.state10),
        state11: Boolean(simulatorState?.km2 && !displayedFeederStates.state11),
    };
}

function getChannelControlFaults({ hasPower, simulatorState, channelRelayStates }) {
    if (!hasPower) {
        return { km1: false, km2: false, km3: false };
    }

    const hasFault = (kmName) => {
        const relayState = channelRelayStates?.[kmName];
        const expectedOn = Boolean(relayState?.commandOn);
        const actualOn = Boolean(simulatorState?.[kmName]);
        return expectedOn !== actualOn;
    };

    return {
        km1: hasFault("km1"),
        km2: hasFault("km2"),
        km3: hasFault("km3"),
    };
}

function getFuseErrorValues({ hasPower, fuseFaults }) {
    const values = Array(8).fill(hasPower ? false : undefined);

    if (!hasPower) {
        return values;
    }

    values[0] = Boolean(fuseFaults.state6 || fuseFaults.state9);
    values[1] = Boolean(fuseFaults.state7 || fuseFaults.state8 || fuseFaults.state10 || fuseFaults.state11);
    return values;
}

function useDelayedKmStates(simulatorState) {
    const km1 = Boolean(simulatorState?.km1);
    const km2 = Boolean(simulatorState?.km2);
    const km3 = Boolean(simulatorState?.km3);

    return useMemo(() => ({ km1, km2, km3 }), [km1, km2, km3]);
}

function useDelayedConfiguratorPower(isPowerOn) {
    return isPowerOn;
}

function useDelayedFeederStates(simulatorState) {
    const state6 = Boolean(simulatorState?.km1 && simulatorState?.sf?.sf4);
    const state7 = Boolean(simulatorState?.km2 && simulatorState?.sf?.sf5);
    const state8 = Boolean(simulatorState?.km2 && simulatorState?.sf?.sf6);
    const state9 = Boolean(simulatorState?.km1 && simulatorState?.sf?.sf7);
    const state10 = Boolean(simulatorState?.km2 && simulatorState?.sf?.sf8);
    const state11 = Boolean(simulatorState?.km2 && simulatorState?.sf?.sf9);
    return useMemo(() => ({
        state6,
        state7,
        state8,
        state9,
        state10,
        state11,
    }), [state6, state7, state8, state9, state10, state11]);
}

