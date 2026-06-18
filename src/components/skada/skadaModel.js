import { KEY_MODES } from "../../state/simulatorState.js";

export const CHANNELS = [
    { title: "НОЧНОЕ", number: 1, kmName: "km1", position: "left" },
    { title: "ВЕЧЕРНЕЕ", number: 2, kmName: "km2", position: "center" },
    { title: "ИЛЛЮМИНАЦИЯ", number: 3, kmName: "km3", position: "right" },
];

export const FEEDERS = [
    {
        title: "ул.Бумажная",
        position: "left",
        breakers: [
            { sfName: "sf4", kmName: "km1", label: "Д6", phase: "Н", busLevel: "upper" },
            { sfName: "sf5", kmName: "km2", label: "Д7", phase: "В", busLevel: "middle" },
            { sfName: "sf6", kmName: "km2", label: "Д8", phase: "В", busLevel: "middle" },
        ],
    },
    {
        title: "Сквер",
        position: "center",
        breakers: [
            { sfName: "sf7", kmName: "km1", label: "Д9", phase: "Н", busLevel: "upper" },
            { sfName: "sf8", kmName: "km2", label: "Д10", phase: "В", busLevel: "middle" },
            { sfName: "sf9", kmName: "km2", label: "Д11", phase: "В", busLevel: "middle" },
        ],
    },
];

export const SCADA_COMMAND_TYPES = {
    ON: "on",
    OFF: "off",
    MODE: "mode",
};

export const SCADA_COMMAND_PULSE_MS = 2000;

export const SCADA_COMMANDS = [
    { id: "night-on", label: "Включить ночное освещение", kmTargets: ["km1"], value: true },
    { id: "night-off", label: "Отключить ночное освещение", kmTargets: ["km1"], value: false },
    { id: "evening-on", label: "Включить вечернее освещение", kmTargets: ["km2"], value: true },
    { id: "evening-off", label: "Отключить вечернее освещение", kmTargets: ["km2"], value: false },
    { id: "full-on", label: "Включить полное освещение", kmTargets: ["km1", "km2"], value: true },
    { id: "full-off", label: "Отключить полное освещение", kmTargets: ["km1", "km2"], value: false },
    { id: "illumination-on", label: "Включить иллюминацию", kmTargets: ["km3"], value: true },
    { id: "illumination-off", label: "Отключить иллюминацию", kmTargets: ["km3"], value: false },
    { id: "auto-all", label: "Авто режим все", mode: KEY_MODES.AUTO },
    { id: "manual-all", label: "Ручной режим все", mode: KEY_MODES.MANUAL },
];

export function getVisualState({ hasPower, active }) {
    if (!hasPower) {
        return "idle";
    }

    return active ? "live" : "ready";
}

export function getBreakerState({ hasPower, isBreakerOn, isEnergized, isFuseFault }) {
    if (!hasPower) {
        return "idle";
    }

    if (isFuseFault || !isBreakerOn) {
        return "ready";
    }

    return isEnergized ? "live" : "ready";
}

export function getBreakerLineState({ hasPower, isBreakerOn, isEnergized, isFuseFault }) {
    if (!hasPower) {
        return "idle";
    }

    if (isFuseFault) {
        return "live";
    }

    if (!isBreakerOn) {
        return "ready";
    }

    return isEnergized ? "live" : "ready";
}

export function getActiveFuseFaultIds(simulatorState, hasPower) {
    if (!hasPower) {
        return [];
    }

    const faultIds = [];

    if (simulatorState.km1 && !simulatorState.sf.sf4) {
        faultIds.push("sf4");
    }

    if (simulatorState.km1 && !simulatorState.sf.sf7) {
        faultIds.push("sf7");
    }

    if (simulatorState.km2 && !simulatorState.sf.sf5) {
        faultIds.push("sf5");
    }

    if (simulatorState.km2 && !simulatorState.sf.sf6) {
        faultIds.push("sf6");
    }

    if (simulatorState.km2 && !simulatorState.sf.sf8) {
        faultIds.push("sf8");
    }

    if (simulatorState.km2 && !simulatorState.sf.sf9) {
        faultIds.push("sf9");
    }

    return faultIds;
}

export function getScadaFaults(simulatorState, channelRelayStates, hasPower) {
    if (!hasPower) {
        return [
            { label: "Нет питания", active: false, idle: true },
            { label: "Неисправность охраны", active: false, idle: true },
            { label: "Неисправность управления", active: false, idle: true },
            { label: "Неисправность цепей управления", active: false, idle: true },
            { label: "Неисправность предохранителей", active: false, idle: true },
        ];
    }

    const fuseFault = getActiveFuseFaultIds(simulatorState, hasPower).length > 0;
    const controlCircuitFault = simulatorState.keyMode !== KEY_MODES.AUTO || !simulatorState.sf.sf2;
    const controlFault = CHANNELS.some(({ kmName }) => {
        const relayState = channelRelayStates?.[kmName];
        const expectedOn = Boolean(relayState?.commandOn);
        const actualOn = Boolean(simulatorState?.[kmName]);
        return expectedOn !== actualOn;
    });

    return [
        { label: "Нет питания", active: false, idle: false },
        { label: "Неисправность охраны", active: !simulatorState.sf.sf2 || !simulatorState.mpPressed, idle: false },
        { label: "Неисправность управления", active: controlFault, idle: false },
        { label: "Неисправность цепей управления", active: controlCircuitFault, idle: false },
        { label: "Неисправность предохранителей", active: fuseFault, idle: false },
    ];
}

export function getScadaSignalItems(simulatorState, hasPower) {
    const isSecurityFault = hasPower && (!simulatorState.sf.sf2 || !simulatorState.mpPressed);
    const isControlKeyOk = hasPower && simulatorState.keyMode === KEY_MODES.AUTO && simulatorState.sf.sf2;
    const isControlKeyFault = hasPower && !isControlKeyOk;

    return [
        { label: "Дверь ШНО", state: hasPower ? (isSecurityFault ? "active" : "ready") : "idle" },
        { label: "Ключ ЦУ", state: hasPower ? (isControlKeyFault ? "active" : isControlKeyOk ? "ready" : "idle") : "idle" },
    ];
}
