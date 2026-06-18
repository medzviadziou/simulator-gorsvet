import "./skada.scss";
import ScadaLeftPanel from "./ScadaLeftPanel.jsx";
import ScadaRightPanel from "./ScadaRightPanel.jsx";
import ScadaScheme from "./ScadaScheme.jsx";
import { getScadaFaults } from "./skadaModel.js";
import { useScadaPendingCommands } from "./useScadaPendingCommands.js";

export default function Skada({ simulatorState, virtualTime, timeSchedule, onVirtualTimeChange, channelRelayStates = {}, channelAutoModes = {}, onSetKm, onSetChannelsMode }) {
    const hasPower = Boolean(simulatorState.qs1 && simulatorState.sf.sf1);
    const faults = getScadaFaults(simulatorState, channelRelayStates, hasPower);
    const { pendingCommands, handleScadaCommand } = useScadaPendingCommands({
        hasPower,
        onSetKm,
        onSetChannelsMode,
    });

    return (
        <div className={`skada ${!hasPower ? "skada--disabled" : ""}`}>
            <ScadaLeftPanel onCommand={handleScadaCommand} />
            <ScadaScheme
                simulatorState={simulatorState}
                hasPower={hasPower}
                pendingCommands={pendingCommands}
                channelRelayStates={channelRelayStates}
                channelAutoModes={channelAutoModes}
            />
            <ScadaRightPanel
                faults={faults}
                simulatorState={simulatorState}
                hasPower={hasPower}
                virtualTime={virtualTime}
                timeSchedule={timeSchedule}
                onVirtualTimeChange={onVirtualTimeChange}
            />
        </div>
    );
}
