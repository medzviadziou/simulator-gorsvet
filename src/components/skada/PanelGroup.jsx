export default function PanelGroup({ title, compact = false, expanded = false, marked = false, plain = false, externalTitle = false, onToggle, children }) {
    const isCollapsible = Boolean(onToggle);
    const arrowClassName = `skada__panel-arrow ${isCollapsible && !expanded ? "skada__panel-arrow--down" : "skada__panel-arrow--up"}`;

    return (
        <section className={`skada__panel ${compact ? "skada__panel--compact" : ""} ${marked ? "skada__panel--marked" : ""} ${plain ? "skada__panel--plain" : ""} ${isCollapsible && !expanded ? "skada__panel--collapsed" : ""}`}>
            {title && !externalTitle ? (
                <div className="skada__panel-title">
                    {isCollapsible ? (
                        <button
                            type="button"
                            className="skada__panel-toggle"
                            onClick={onToggle}
                            aria-expanded={expanded}
                        >
                            <span className={arrowClassName} />
                            <span>{title}</span>
                        </button>
                    ) : (
                        <>
                            {marked ? <span className={arrowClassName} /> : null}
                            <span>{title}</span>
                        </>
                    )}
                </div>
            ) : null}
            {title && externalTitle ? <div className="skada__panel-title skada__panel-title--outside">{title}</div> : null}
            {(!isCollapsible || expanded) ? <div className="skada__panel-body">{children}</div> : null}
        </section>
    );
}
