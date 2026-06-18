import { useEffect, useRef, useState } from "react";
import { CHANNELS, SCADA_COMMAND_PULSE_MS, SCADA_COMMAND_TYPES } from "./skadaModel.js";

const MODE_COMMAND_KEY = "__mode";

export function useScadaPendingCommands({ hasPower, onSetKm, onSetChannelsMode }) {
    const commandTimersRef = useRef({});
    const [pendingCommands, setPendingCommands] = useState({});

    useEffect(() => () => {
        Object.values(commandTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
    }, []);

    const clearCommandTimer = (commandKey) => {
        const timerId = commandTimersRef.current[commandKey];

        if (timerId) {
            window.clearTimeout(timerId);
            delete commandTimersRef.current[commandKey];
        }
    };

    const setPendingForTargets = (targets, commandType) => {
        setPendingCommands((currentCommands) => {
            const nextCommands = { ...currentCommands };
            targets.forEach((kmName) => {
                nextCommands[kmName] = commandType;
            });
            return nextCommands;
        });
    };

    const clearPendingForTargets = (targets) => {
        setPendingCommands((currentCommands) => {
            const nextCommands = { ...currentCommands };
            targets.forEach((kmName) => {
                delete nextCommands[kmName];
            });
            return nextCommands;
        });
    };

    const schedulePendingClear = (commandKey, targets) => {
        clearCommandTimer(commandKey);
        commandTimersRef.current[commandKey] = window.setTimeout(() => {
            clearPendingForTargets(targets);
            delete commandTimersRef.current[commandKey];
        }, SCADA_COMMAND_PULSE_MS);
    };

    const sendKmCommand = (kmTargets, value) => {
        const targets = kmTargets.filter((kmName) => CHANNELS.some((channel) => channel.kmName === kmName));
        const commandType = value ? SCADA_COMMAND_TYPES.ON : SCADA_COMMAND_TYPES.OFF;

        if (!targets.length) {
            return;
        }

        setPendingForTargets(targets, commandType);
        clearCommandTimer(MODE_COMMAND_KEY);

        targets.forEach((kmName) => {
            clearCommandTimer(kmName);
            if (hasPower || !value) {
                onSetKm?.(kmName, value);
            }

            schedulePendingClear(kmName, [kmName]);
        });
    };

    const sendModeCommand = (mode) => {
        const targets = CHANNELS.map(({ kmName }) => kmName);

        setPendingForTargets(targets, SCADA_COMMAND_TYPES.MODE);
        targets.forEach((kmName) => clearCommandTimer(kmName));
        clearCommandTimer(MODE_COMMAND_KEY);

        onSetChannelsMode?.(mode);
        schedulePendingClear(MODE_COMMAND_KEY, targets);
    };

    const handleScadaCommand = (command) => {
        if (command.mode) {
            sendModeCommand(command.mode);
            return;
        }

        sendKmCommand(command.kmTargets, command.value);
    };

    return {
        pendingCommands: hasPower ? pendingCommands : {},
        handleScadaCommand,
    };
}
