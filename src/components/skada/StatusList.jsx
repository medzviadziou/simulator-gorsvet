export default function StatusList({ items }) {
    return (
        <ul className="skada__fault-list">
            {items.map((item) => (
                <li key={item.label} className={`${item.active ? "skada__fault--active" : item.idle ? "skada__fault--idle" : ""} ${item.blinking ? "skada__fault--blinking" : ""}`.trim()}>
                    {item.label}
                </li>
            ))}
        </ul>
    );
}
