import "./schemeShno.scss";
import { useEffect, useState } from "react";

const schemeImage = new URL("../../assets/img/Shema.svg", import.meta.url).href;
const schemeImage2 = new URL("../../assets/img/Shema-2.svg", import.meta.url).href;
const schemeAlt = "SHNO principal scheme";

export default function SchemeShno() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <section className="scheme-shno" aria-label="shno schematic">
            <div className="scheme-shno__previews">
                <button
                    type="button"
                    className="scheme-shno__preview"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open scheme"
                >
                    <img className="scheme-shno__image" src={schemeImage} alt={schemeAlt} />
                </button>

                <button
                    type="button"
                    className="scheme-shno__preview scheme-shno__preview--secondary"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open second scheme"
                >
                    <img className="scheme-shno__image" src={schemeImage2} alt={schemeAlt} />
                </button>
            </div>

            {isOpen ? (
                <div
                    className="scheme-shno__modal"
                    role="presentation"
                    onMouseDown={() => setIsOpen(false)}
                >
                    <button
                        type="button"
                        className="scheme-shno__modal-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close scheme"
                    >
                        x
                    </button>
                    <img
                        className="scheme-shno__modal-image"
                        src={schemeImage2}
                        alt={schemeAlt}
                        onMouseDown={(event) => event.stopPropagation()}
                    />
                    <img
                        className="scheme-shno__modal-image"
                        src={schemeImage}
                        alt={schemeAlt}
                        onMouseDown={(event) => event.stopPropagation()}
                    />
                </div>
            ) : null}
        </section>
    );
}
