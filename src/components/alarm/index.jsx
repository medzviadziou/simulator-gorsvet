import "./alarm.scss";

export default function Alarm({value}) {
    const getClass = () => {
        switch (value) {
            case true:
                return "alarm alarm--on";
            case false:
                return "alarm alarm--off";
            default:
                return "alarm alarm--idle";
        }
    };

    return (
        <div className="alarm__wrapper">
            <div className={getClass()} />
        </div>
    );
}
