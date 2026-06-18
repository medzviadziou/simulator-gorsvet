import "./lightning.scss";

export default function Lightning({ state = "off" }) {
    // state: "on" | "off" | "default" | "runo"

    return <div className={`lightning lightning--${state}`} />;
}