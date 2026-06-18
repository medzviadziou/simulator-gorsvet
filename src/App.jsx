import { useCallback, useMemo, useReducer, useState } from "react";
import "./App.css";
import Configurator from "./components/configurator/index.jsx";
import ShuShno from "./components/shuShno/index.jsx";
import Skada from "./components/skada/index.jsx";
import StreetView from "./components/streetView/index.jsx";
import SchemeShno from "./components/schemeShno/index.jsx";
import ConfigDeviceModal from "./components/configDeviceModal/index.jsx";
import { initialSimulatorState, KEY_MODES, simulatorActions, simulatorReducer } from "./state/simulatorState.js";
import { DEFAULT_TIME_SCHEDULE, getScheduledCommands } from "./lib/schedule.js";

const SCADA_KM_NAMES = ["km1", "km2", "km3"];

const INITIAL_CHANNEL_AUTO_MODES = {
    km1: true,
    km2: true,
    km3: true,
};

function App() {
    const [simulatorState, dispatch] = useReducer(simulatorReducer, initialSimulatorState);
    const [virtualTime, setVirtualTime] = useState(() => new Date());
    const [timeSchedule, setTimeSchedule] = useState(DEFAULT_TIME_SCHEDULE);
    const [channelAutoModes, setChannelAutoModes] = useState(INITIAL_CHANNEL_AUTO_MODES);
    const [channelRelayCommands, setChannelRelayCommands] = useState({});
    const [channelRelayStates, setChannelRelayStates] = useState({});
    const [scadaInteractionSeq, setScadaInteractionSeq] = useState(0);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [kmStopHold, setKmStopHold] = useState({
        km1: false,
        km2: false,
        km3: false,
    });
    const scheduledCommands = useMemo(
        () => getScheduledCommands(virtualTime, timeSchedule),
        [virtualTime, timeSchedule]
    );
    const powerSyncKey = `${Boolean(simulatorState.qs1)}:${Boolean(simulatorState.sf.sf1)}:${Boolean(simulatorState.sf.sf2)}`;
    const resolvedChannelRelayCommands = useMemo(() => {
        const nextCommands = {};

        SCADA_KM_NAMES.forEach((kmName) => {
            const externalCommand = channelRelayCommands[kmName];

            if (channelAutoModes[kmName]) {
                nextCommands[kmName] = {
                    ...externalCommand,
                    commandOn: scheduledCommands[kmName] ?? false,
                    manualOn: false,
                    powerSyncKey,
                };
                return;
            }

            if (externalCommand) {
                nextCommands[kmName] = externalCommand;
            }
        });

        return nextCommands;
    }, [
        channelRelayCommands,
        channelAutoModes,
        scheduledCommands,
        powerSyncKey,
    ]);

    const handleScadaSetKm = (kmName, value) => {
        if (!SCADA_KM_NAMES.includes(kmName)) {
            return;
        }

        setChannelAutoModes((currentModes) => ({
            ...currentModes,
            [kmName]: false,
        }));
        setChannelRelayCommands((currentCommands) => ({
            ...currentCommands,
            [kmName]: {
                commandOn: Boolean(value),
                manualOn: true,
                sequence: (currentCommands[kmName]?.sequence ?? 0) + 1,
            },
        }));
        setScadaInteractionSeq((valueSeq) => valueSeq + 1);
    };

    const handleTimeScheduleChange = useCallback((nextSchedule) => {
        setTimeSchedule((currentSchedule) => {
            const normalizedSchedule = {
                automationOn: nextSchedule?.automationOn ?? currentSchedule.automationOn,
                automationOff: nextSchedule?.automationOff ?? currentSchedule.automationOff,
                economyOn: nextSchedule?.economyOn ?? currentSchedule.economyOn,
                economyOff: nextSchedule?.economyOff ?? currentSchedule.economyOff,
            };

            if (
                currentSchedule.automationOn === normalizedSchedule.automationOn &&
                currentSchedule.automationOff === normalizedSchedule.automationOff &&
                currentSchedule.economyOn === normalizedSchedule.economyOn &&
                currentSchedule.economyOff === normalizedSchedule.economyOff
            ) {
                return currentSchedule;
            }

            return normalizedSchedule;
        });
    }, []);

    const handleChannelModeChange = (kmName, isAutoMode) => {
        if (!SCADA_KM_NAMES.includes(kmName)) {
            return;
        }

        setChannelAutoModes((currentModes) => {
            if (currentModes[kmName] === isAutoMode) {
                return currentModes;
            }

            return {
                ...currentModes,
                [kmName]: isAutoMode,
            };
        });
    };

    const handleScadaSetAllModes = (mode) => {
        const manualOn = mode === KEY_MODES.MANUAL;
        const scheduledCommands = getScheduledCommands(virtualTime, timeSchedule);

        setChannelAutoModes((currentModes) => {
            const nextModeValue = !manualOn;
            let hasChanges = false;
            const nextModes = { ...currentModes };

            SCADA_KM_NAMES.forEach((kmName) => {
                if (nextModes[kmName] !== nextModeValue) {
                    nextModes[kmName] = nextModeValue;
                    hasChanges = true;
                }
            });

            return hasChanges ? nextModes : currentModes;
        });
        setChannelRelayCommands((currentCommands) => {
            const nextCommands = { ...currentCommands };

            SCADA_KM_NAMES.forEach((kmName) => {
                nextCommands[kmName] = {
                    ...nextCommands[kmName],
                    commandOn: manualOn ? nextCommands[kmName]?.commandOn : scheduledCommands[kmName],
                    manualOn,
                    sequence: (nextCommands[kmName]?.sequence ?? 0) + 1,
                };
            });

            return nextCommands;
        });
        setScadaInteractionSeq((valueSeq) => valueSeq + 1);
    };

    const handleChannelRelayStateChange = (kmName, nextRelayState) => {
        if (!SCADA_KM_NAMES.includes(kmName)) {
            return;
        }

        setChannelRelayStates((currentStates) => {
            const currentRelayState = currentStates[kmName];
            const normalizedNextState = {
                commandOn: Boolean(nextRelayState?.commandOn),
                manualOn: Boolean(nextRelayState?.manualOn),
            };

            if (
                currentRelayState?.commandOn === normalizedNextState.commandOn &&
                currentRelayState?.manualOn === normalizedNextState.manualOn
            ) {
                return currentStates;
            }

            return {
                ...currentStates,
                [kmName]: normalizedNextState,
            };
        });
    };

    const handleKmStopHoldChange = (kmName, isHeld) => {
        if (!SCADA_KM_NAMES.includes(kmName)) {
            return;
        }

        setKmStopHold((current) => ({
            ...current,
            [kmName]: Boolean(isHeld),
        }));
    };

  return (
    <>
        <div className="app">
            <div className="app__main">
                <div className="app__left">
                    <section className="app__panel app__panel--configurator" aria-label="Конфигуратор. Задачи логики.">
                        <div className="app__panel-title">
                            <span>Вид окна "Задачи логики" в КОНФИГУРАТОРЕ</span>
                            <button className="app__config-button" title="Конфигурация, записанная в устройство" onClick={() => setIsConfigModalOpen(true)}>Конфигурация на устройстве</button>
                        </div>
                        <Configurator
                            simulatorState={simulatorState}
                            virtualTime={virtualTime}
                            setVirtualTime={setVirtualTime}
                            onTimeScheduleChange={handleTimeScheduleChange}
                            dispatch={dispatch}
                            actions={simulatorActions}
                            channelRelayCommands={resolvedChannelRelayCommands}
                            channelRelayStates={channelRelayStates}
                            onChannelModeChange={handleChannelModeChange}
                            onChannelRelayStateChange={handleChannelRelayStateChange}
                            kmStopHold={kmStopHold}
                        />
                    </section>
                    <section className="app__panel app__panel--skada" aria-label="СУНО БЕМН">
                        <div className="app__panel-title">СУНО БЕМН</div>
                        <div className="app__skada">
                            <Skada
                                simulatorState={simulatorState}
                                virtualTime={virtualTime}
                                timeSchedule={timeSchedule}
                                onVirtualTimeChange={setVirtualTime}
                                channelRelayStates={channelRelayStates}
                                channelAutoModes={channelAutoModes}
                                onSetKm={handleScadaSetKm}
                                onSetChannelsMode={handleScadaSetAllModes}
                            />
                        </div>
                    </section>
                </div>
                <ShuShno
                    simulatorState={simulatorState}
                    virtualTime={virtualTime}
                    timeSchedule={timeSchedule}
                    dispatch={dispatch}
                    actions={simulatorActions}
                    channelRelayStates={channelRelayStates}
                    scadaInteractionSeq={scadaInteractionSeq}
                    onKmStopHoldChange={handleKmStopHoldChange}
                />
            </div>
            <div className="app__right">
                <section className="app__panel app__panel--right" aria-label="Камера №1">
                    <div className="app__panel-title">Вид на улицу Бумажная</div>
                    <StreetView
                        currentTime={virtualTime}
                        schedule={timeSchedule}
                        simulatorState={simulatorState}
                        hasPower={Boolean(simulatorState.qs1 && simulatorState.sf.sf1)}
                    />
                </section>
                <section className="app__panel app__panel--right" aria-label="Схема шкафа ШНО">
                    <div className="app__panel-title">Схема ШНО</div>
                    <SchemeShno />
                </section>
            </div>
        </div>

        {isConfigModalOpen && <ConfigDeviceModal onClose={() => setIsConfigModalOpen(false)} />}
    </>
  )
}

export default App
