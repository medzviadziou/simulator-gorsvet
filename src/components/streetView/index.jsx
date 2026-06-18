import "./streetView.scss";

import streetSunset from "../../assets/img/street/sunset.png";
import streetSunsetIllumination from "../../assets/img/street/sunset-illumination.png";
import streetEvening from "../../assets/img/street/evening.png";
import streetEveningIllumination from "../../assets/img/street/evening-illumination.png";
import streetNight from "../../assets/img/street/night.png";
import streetNightIllumination from "../../assets/img/street/night-illumination.png";
import streetMorning from "../../assets/img/street/morning.png";
import streetMorningIllumination from "../../assets/img/street/morning-illumination.png";
import streetDawn from "../../assets/img/street/dawn.png";
import streetDawnIllumination from "../../assets/img/street/dawn-illumination.png";
import streetDay from "../../assets/img/street/day.png";
import streetDayIllumination from "../../assets/img/street/day-illumination.png";
import { getStreetSceneId } from "../../lib/schedule.js";

const STREET_SCENES = {
    sunset: { image: streetSunset, illuminationImage: streetSunsetIllumination },
    evening: { image: streetEvening, illuminationImage: streetEveningIllumination },
    night: { image: streetNight, illuminationImage: streetNightIllumination },
    morning: { image: streetMorning, illuminationImage: streetMorningIllumination },
    dawn: { image: streetDawn, illuminationImage: streetDawnIllumination },
    day: { image: streetDay, illuminationImage: streetDayIllumination },
};

const STREET_LIGHT_CIRCUITS = {
    1: { sfName: "sf4", kmName: "km1" },
    2: { sfName: "sf5", kmName: "km2" },
    3: { sfName: "sf6", kmName: "km2" },
};

const STREET_LIGHTS = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2].map((circuit, index) => {
    const number = index + 1;
    return {
        id: `street-light-${String(number).padStart(2, "0")}`,
        circuit,
        x: getLightX(number),
        y: getLightY(number),
        size: getLightSize(number),
    };
});

export default function StreetView({ currentTime, schedule, simulatorState, hasPower }) {
    const sceneId = getStreetSceneId(currentTime, schedule);
    const scene = STREET_SCENES[sceneId] ?? STREET_SCENES.day;
    const isIlluminationImageOn = Boolean(hasPower && simulatorState?.km3 && simulatorState?.sf?.sf10);
    const image = isIlluminationImageOn ? scene.illuminationImage : scene.image;
    const cameraTime = getValidDate(currentTime);

    return (
        <section className="street-view" aria-label="вид улицы">
            <div className="street-view__stage">
                <img src={image} alt="" className="street-view__image" draggable="false" />
                <div className="street-view__lights" aria-hidden="true">
                    {STREET_LIGHTS.map((light) => (
                        <span
                            key={light.id}
                            className={`street-view__light ${isStreetLightPowered(light, simulatorState, hasPower) ? "street-view__light--on" : ""}`}
                            style={{
                                "--x": light.x,
                                "--y": light.y,
                                "--size": light.size,
                            }}
                        />
                    ))}
                </div>
                <div className="street-view__timestamp" aria-hidden="true">
                    {formatCameraDateTime(cameraTime)}
                </div>
            </div>
        </section>
    );
}

function isStreetLightPowered(light, simulatorState, hasPower) {
    const circuit = STREET_LIGHT_CIRCUITS[light.circuit];

    if (!circuit) {
        return false;
    }

    return Boolean(
        hasPower &&
        simulatorState?.sf?.[circuit.sfName] &&
        simulatorState?.[circuit.kmName]
    );
}

function getLightX(index) {
    const positions = [15, 29.5, 37, 40, 42.2, 43.5, 44.7, 56.7, 57.8, 59, 61.3, 64.4, 72.2, 86];
    return `${positions[index - 1]}%`;
}

function getLightY(index) {
    const positions = [80, 51, 45, 42, 39.9, 38.5, 37.2, 37.2, 38.5, 39.8, 42, 45, 51, 80];
    return `${positions[index - 1]}%`;
}

function getLightSize(index) {
    const sizes = [6.4, 2.8, 1.7, 1.3, 1, 0.8, 0.6, 0.6, 0.8, 1, 1.3, 1.7, 2.8, 5.55];
    return `${sizes[index - 1]}%`;
}

function getValidDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    return new Date();
}

function formatCameraDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
