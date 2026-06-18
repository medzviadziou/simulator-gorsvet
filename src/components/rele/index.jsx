import "./rele.scss";
import { useState } from "react";

export default function Rele({ disabled = false, defaultChecked = false, checked, onChange }) {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
        if (disabled) return;

        const nextChecked = !isChecked;
        if (!isControlled) {
            setInternalChecked(nextChecked);
        }
        onChange?.(nextChecked);
    };

    const getClass = () => {
        let cls = "rele";

        if (!isChecked) cls += " rele--off";
        if (disabled) cls += " rele--disabled";

        return cls;
    };

    return (
        <div className={getClass()} onClick={handleClick}>
            <div className="rele__body" />

            <div className="rele__knob">
                <div className="rele__knobOuter" />
                <div className="rele__knobInner" />
                <div className="rele__gloss" />
            </div>
        </div>
    );
}
