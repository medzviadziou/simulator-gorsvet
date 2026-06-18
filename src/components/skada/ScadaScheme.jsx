import {
    CHANNELS,
    FEEDERS,
    getBreakerLineState,
    getBreakerState,
    getVisualState,
} from "./skadaModel.js";

export default function ScadaScheme({ simulatorState, hasPower, pendingCommands = {}, channelRelayStates = {}, channelAutoModes = {} }) {
    const topBusState = hasPower ? "live" : "idle";
    const channelLineStates = {
        km1: getVisualState({ hasPower, active: simulatorState.km1 }),
        km2: getVisualState({ hasPower, active: simulatorState.km2 }),
        km3: getVisualState({ hasPower, active: simulatorState.km3 }),
    };

    return (
        <div className="skada__canvas">
            <div className="skada__drawing">
                <span className={`skada__top-bus skada__line--${topBusState}`} />

                {CHANNELS.map((channel) => (
                    <ScadaChannel
                        key={channel.kmName}
                        channel={channel}
                        simulatorState={simulatorState}
                        hasPower={hasPower}
                        pendingCommand={pendingCommands[channel.kmName]}
                        commandOn={channelRelayStates[channel.kmName]?.commandOn}
                        isAutoMode={channelAutoModes[channel.kmName] !== false}
                        topBusState={topBusState}
                    />
                ))}

                <div className="skada__distribution">
                    <span className={`skada__bus skada__bus--upper skada__line--${channelLineStates.km1}`} />
                    <span className={`skada__bus skada__bus--middle skada__line--${channelLineStates.km2}`} />
                    <span className={`skada__bus skada__bus--lower skada__line--${channelLineStates.km3}`} />

                    <span className={`skada__channel-lead skada__channel-lead--left skada__line--${channelLineStates.km1}`} />
                    <span className={`skada__channel-lead skada__channel-lead--center skada__line--${channelLineStates.km2}`} />
                    <span className={`skada__channel-lead skada__channel-lead--right skada__line--${channelLineStates.km3}`} />

                    {FEEDERS.map((feeder) => (
                        <ScadaFeeder
                            key={feeder.title}
                            feeder={feeder}
                            simulatorState={simulatorState}
                            hasPower={hasPower}
                        />
                    ))}

                    <div className="skada__feeder skada__feeder--right skada__feeder--empty" />
                </div>
            </div>
        </div>
    );
}

function ScadaChannel({ channel, simulatorState, hasPower, pendingCommand, commandOn, isAutoMode, topBusState }) {
    const isActive = Boolean(simulatorState[channel.kmName]);
    const state = getVisualState({ hasPower, active: isActive });
    const commandClassName = pendingCommand ? `skada__channel-card--command-${pendingCommand}` : "";
    const commandSignalState = getVisualState({ hasPower, active: commandOn });

    return (
        <div className={`skada__channel skada__channel--${channel.position}`}>
            <span className={`skada__drop skada__line--${topBusState}`} />
            <div className="skada__channel-title">{channel.title}</div>
            <button
                type="button"
                className={`skada__channel-card skada__channel-card--${state} ${commandClassName}`}
                disabled
                aria-label={`${channel.title}: ${isActive ? "отключить" : "включить"} дистанционно`}
            >
                <span className={`skada__channel-command-signal skada__channel-command-signal--${commandSignalState}`} />
                <span className="skada__channel-number">{channel.number}</span>
                {hasPower && isAutoMode ? <span className="skada__channel-mode">A</span> : null}
            </button>
        </div>
    );
}

function ScadaFeeder({ feeder, simulatorState, hasPower }) {
    return (
        <div className={`skada__feeder skada__feeder--${feeder.position}`}>
            <span className="skada__feeder-frame" />
            <div className="skada__breakers">
                {feeder.breakers.map((breaker) => (
                    <ScadaBreaker
                        key={breaker.sfName}
                        breaker={breaker}
                        simulatorState={simulatorState}
                        hasPower={hasPower}
                    />
                ))}
            </div>
            <div className="skada__feeder-title">{feeder.title}</div>
        </div>
    );
}

function ScadaBreaker({ breaker, simulatorState, hasPower }) {
    const isBreakerOn = Boolean(simulatorState.sf[breaker.sfName]);
    const isExpectedOn = hasPower && Boolean(simulatorState[breaker.kmName]);
    const isEnergized = hasPower && isBreakerOn && simulatorState[breaker.kmName];
    const isFuseFault = isExpectedOn && !isBreakerOn;
    const state = getBreakerState({ hasPower, isBreakerOn, isEnergized, isFuseFault });
    const lineState = getBreakerLineState({ hasPower, isBreakerOn, isEnergized, isFuseFault });
    const breakerFaultClassName = isFuseFault ? "skada__breaker--fault-latched" : "";

    return (
        <button
            type="button"
            className={`skada__breaker skada__breaker--${state} skada__breaker--bus-${breaker.busLevel} ${breakerFaultClassName}`}
            disabled
            aria-label={`${breaker.sfName.toUpperCase()} ${isBreakerOn ? "ON" : "OFF"}`}
        >
            <span className={`skada__breaker-line skada__breaker-line--${breaker.busLevel} skada__line--${lineState}`} />
            <span className="skada__breaker-name">{breaker.label}</span>
            <span className="skada__breaker-label">{breaker.phase}</span>
        </button>
    );
}
