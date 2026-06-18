import { useState } from "react";
import PanelGroup from "./PanelGroup.jsx";
import { SCADA_COMMANDS } from "./skadaModel.js";

export default function ScadaLeftPanel({ onCommand }) {
    const [isManagementOpen, setIsManagementOpen] = useState(true);

    return (
        <aside className="skada__side skada__side--left">
            <div className="skada__window-title">Схема "ТП 3404"          RUNO 9.7.26.0</div>
            <PanelGroup
                title="Управление"
                expanded={isManagementOpen}
                onToggle={() => setIsManagementOpen((isOpen) => !isOpen)}
            >
                <div className="skada__commands-frame">
                    {SCADA_COMMANDS.map((command) => (
                        <button key={command.id} type="button" onClick={() => onCommand?.(command)}>
                            {command.label}
                        </button>
                    ))}
                </div>
            </PanelGroup>
        </aside>
    );
}
