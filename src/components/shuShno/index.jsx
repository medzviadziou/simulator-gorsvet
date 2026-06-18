import "./shuShno.scss";
import { useEffect, useState } from "react";

import bgImage from "../../assets/img/000.png";
import img318 from "../../assets/img/318.png";
import imgQs1 from "../../assets/img/QS1.png";
import imgEl1 from "../../assets/img/EL1.png";
import imgR3 from "../../assets/img/R3.png";
import imgSfOn from "../../assets/img/SF-ON.png";
import imgSfOff from "../../assets/img/SF-OFF.png";
import imgXs from "../../assets/img/XS.png";
import imgKmOff from "../../assets/img/KM-OFF.png";
import imgKmOn from "../../assets/img/KM-ON.png";
import imgKm3Off from "../../assets/img/KM3-OFF.png";
import imgKm3On from "../../assets/img/KM3-ON.png";
import imgSfOnOt from "../../assets/img/SF-ON-OT.png";
import imgSfOffOt from "../../assets/img/SF-OFF-OT.png";
import imgKvs from "../../assets/img/KVS.png";
import imgMpOff from "../../assets/img/MP-OFF.png";
import imgMpOn from "../../assets/img/MP-ON.png";
import { formatMeterRegister } from "../../lib/meterReadings.js";
import Kp104 from "../kp104/index.jsx";

export default function ShuShno({ simulatorState, virtualTime, timeSchedule, dispatch, actions, channelRelayStates = {}, scadaInteractionSeq = 0, onKmStopHoldChange }) {
    const isEl1Off = !simulatorState.qs1 || simulatorState.mpPressed || !simulatorState.sf.sf2 || !simulatorState.sf.sf3;
    const isKp104Disabled = !simulatorState.sf.sf2;
    const isR3Active = simulatorState.qs1 && simulatorState.sf.sf1;
    const meterDigits = formatMeterRegister(virtualTime, timeSchedule);
    const topRed1On = Boolean(channelRelayStates.km1?.commandOn);
    const topRed2On = Boolean(channelRelayStates.km2?.commandOn);
    const topRed3On = Boolean(channelRelayStates.km3?.commandOn);
    const isTouchControlMode = useTouchControlMode();
    const handleMpPressStart = () => dispatch(actions.setMpPressed(true));
    const handleMpPressEnd = () => dispatch(actions.setMpPressed(false));
    const handleMpToggle = () => dispatch(actions.toggleMp());
    const mpButtonHandlers = isTouchControlMode
        ? {
            onClick: handleMpToggle,
            "aria-label": `MP ${simulatorState.mpPressed ? "opened" : "closed"}`,
        }
        : {
            onPointerEnter: handleMpPressStart,
            onPointerLeave: handleMpPressEnd,
            onPointerCancel: handleMpPressEnd,
            "aria-label": "MP",
        };

    useEffect(() => {
        if (!isKp104Disabled) {
            return;
        }

        dispatch(actions.setKm1(false));
        dispatch(actions.setKm2(false));
        dispatch(actions.setKm3(false));
    }, [isKp104Disabled, dispatch, actions]);

    const renderSf = (name, withOt = false) => {
        const isOn = simulatorState.sf[name];
        const onSrc = withOt ? imgSfOnOt : imgSfOn;
        const offSrc = withOt ? imgSfOffOt : imgSfOff;
        const baseAlt = withOt ? "SF-OT" : "SF";

        return (
            <button
                type="button"
                className="shu-shno__sf-toggle"
                onClick={() => dispatch(actions.toggleSf(name))}
                aria-label={`${name.toUpperCase()} ${isOn ? "ON" : "OFF"}`}
            >
                <img src={isOn ? onSrc : offSrc} alt={`${baseAlt}-${isOn ? "ON" : "OFF"}`} className="shu-shno__image" />
            </button>
        );
    };

    return (
        <div className="shu-shno">
            <div className="shu-shno__scheme" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="shu-shno__side shu-shno__side--left">
                    <div className="shu-shno__side-item" />
                </div>

                <div className="shu-shno__center">
                    <div className="shu-shno__section shu-shno__section--spacer-top" style={{ height: "3.2%" }} />

                    <div className="shu-shno__section shu-shno__section--feed" style={{ height: "6.6%" }}>
                        <div className="shu-shno__fider">
                            <div className={`shu-shno__lamp ${isEl1Off ? "shu-shno__lamp--off" : ""}`}>
                                <img
                                    src={imgEl1}
                                    alt="EL1"
                                    className="shu-shno__image shu-shno__image--lamp"
                                />
                            </div>
                        </div>
                        <div className="shu-shno__sensor">
                            <button
                                type="button"
                                className="shu-shno__mp-toggle"
                                {...mpButtonHandlers}
                            >
                                <img
                                    src={simulatorState.mpPressed ? imgMpOn : imgMpOff}
                                    alt={simulatorState.mpPressed ? "MP-ON" : "MP-OFF"}
                                    className="shu-shno__image shu-shno__image--mp"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="shu-shno__section shu-shno__section--spacer-small" style={{ height: "2.8%" }} />

                    <div className="shu-shno__section shu-shno__section--pair" style={{ height: "12%" }}>
                        <div className="shu-shno__meter">
                            <img src={img318} alt="318" className="shu-shno__image" />
                            <span className={`shu-shno__meter-display ${!simulatorState.qs1 ? "shu-shno__meter-display--off" : ""}`} aria-hidden="true">
                                <span className="shu-shno__meter-digits">{meterDigits}</span>
                                <span className="shu-shno__meter-unit">kW -h</span>
                            </span>
                        </div>
                        <div className="shu-shno__qs1">
                            <img src={imgQs1} alt="QS1" className="shu-shno__image" />
                            <button
                                type="button"
                                className={`shu-shno__qs1-handle ${simulatorState.qs1 ? "shu-shno__qs1-handle--on" : ""}`}
                                onClick={() => dispatch(actions.toggleQs1())}
                                aria-label="Переключить QS1"
                            />
                        </div>
                    </div>

                    <div className="shu-shno__section shu-shno__section--bus" style={{ height: "5.2%" }}>
                        <div className="shu-shno__bus-item" />
                    </div>

                    <div className="shu-shno__section shu-shno__section--line" style={{ height: "7%" }}>
                        <div className="shu-shno__r3">
                            <span className={`shu-shno__r3-indicator shu-shno__r3-indicator--gradient ${isR3Active ? "shu-shno__r3-indicator--visible" : ""}`}>
                                <span className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--red ${topRed1On ? "shu-shno__r3-indicator-dot--lit" : ""}`} />
                                <span className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--red ${topRed2On ? "shu-shno__r3-indicator-dot--lit" : ""}`} />
                                <span className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--red ${topRed3On ? "shu-shno__r3-indicator-dot--lit" : ""}`} />
                                <span className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--yellow ${isR3Active ? "shu-shno__r3-indicator-dot--pulse-yellow" : ""}`} />
                                <span className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--green ${isR3Active ? "shu-shno__r3-indicator-dot--pulse-green" : ""}`} />
                                <span key={`r3-red-${scadaInteractionSeq}`} className={`shu-shno__r3-indicator-dot shu-shno__r3-indicator-dot--red ${isR3Active ? "shu-shno__r3-indicator-dot--pulse-red" : ""}`} />
                            </span>
                            <span className={`shu-shno__r3-indicator ${isR3Active ? "shu-shno__r3-indicator--on" : ""}`} />
                            <img src={imgR3} alt="R3" className="shu-shno__image" />
                        </div>
                        {renderSf("sf1", true)}
                        {renderSf("sf2", true)}
                        {renderSf("sf3", true)}
                        <img src={imgXs} alt="XS" className="shu-shno__image" />
                        <Kp104
                            simulatorState={simulatorState}
                            dispatch={dispatch}
                            actions={actions}
                            disabled={isKp104Disabled}
                            onStopHoldChange={onKmStopHoldChange}
                        />
                    </div>

                    <div className="shu-shno__section shu-shno__section--bus" style={{ height: "5.2%" }}>
                        <div className="shu-shno__bus-item" />
                    </div>

                    <div className="shu-shno__section shu-shno__section--pair" style={{ height: "9%" }}>
                        <img src={simulatorState.km1 ? imgKmOn : imgKmOff} alt={simulatorState.km1 ? "KM-ON" : "KM-OFF"} className="shu-shno__image" />
                        <img src={simulatorState.km2 ? imgKmOn : imgKmOff} alt={simulatorState.km2 ? "KM-ON" : "KM-OFF"} className="shu-shno__image" />
                        <img src={simulatorState.km3 ? imgKm3On : imgKm3Off} alt={simulatorState.km3 ? "KM3-ON" : "KM3-OFF"} className="shu-shno__image" />
                    </div>

                    <div className="shu-shno__section shu-shno__section--bus" style={{ height: "5.2%" }}>
                        <div className="shu-shno__bus-item" />
                    </div>

                    <div className="shu-shno__section shu-shno__section--feed" style={{ height: "5.2%" }}>
                        <div className="shu-shno__fider">
                            {renderSf("sf4", true)}
                            {renderSf("sf5", true)}
                            {renderSf("sf6", true)}
                        </div>
                        <div className="shu-shno__fider">
                            {renderSf("sf7", true)}
                            {renderSf("sf8", true)}
                            {renderSf("sf9", true)}
                        </div>
                        <div className="shu-shno__fider">
                            {renderSf("sf10", true)}
                        </div>
                    </div>

                    <div className="shu-shno__section shu-shno__section--bus" style={{ height: "5.2%" }}>
                        <div className="shu-shno__bus-item" />
                    </div>

                    <div className="shu-shno__section shu-shno__section--feed" style={{ height: "3.4%" }}>
                        <div className="shu-shno__fider">
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                        </div>
                        <div className="shu-shno__fider">
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                        </div>
                        <div className="shu-shno__fider">
                            <img src={imgKvs} alt="КВС" className="shu-shno__image" />
                        </div>
                    </div>

                    <div className="shu-shno__section shu-shno__section--spacer-bottom" style={{ height: "30%" }} />
                </div>

                <div className="shu-shno__side shu-shno__side--right">
                    <div className="shu-shno__side-item" />
                </div>
            </div>
        </div>
    );
}

function useTouchControlMode() {
    const [isTouchControlMode, setIsTouchControlMode] = useState(() => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return false;
        }

        return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return undefined;
        }

        const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
        const handleChange = () => setIsTouchControlMode(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isTouchControlMode;
}
