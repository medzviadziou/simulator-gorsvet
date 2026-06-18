import "./configDeviceModal.scss";
import configImage from "../../assets/img/Config.png";

const CONFIG_IMAGE_SIZE = { width: 961, height: 861 };
const DISCRETE_LABELS = [
    "Контроль двери",
    "Положения ключа в ШНО",
    "Состояние КМ-1",
    "Состояние КМ-2",
    "Состояние КМ-3",
    "Автомат SF4",
    "Автомат SF5",
    "Автомат SF6",
    "Автомат SF7",
    "Автомат SF8",
    "Автомат SF9",
];
const CONFIG_HOTSPOTS = [
    ...Array.from({ length: 11 }, (_, index) => ({
        id: `d${index + 1}`,
        label: DISCRETE_LABELS[index],
        shape: "square",
        x: 22 + index * 24.3,
        y: 225,
        width: 12,
        height: 12,
    })),
    ...[
        ["data-ku-1", "График по поторому включается канал №1, в данном случае это график освещения, включается при наступлении гражданских сумерек и отключается с рассветом", 342, 200],
        ["data-ku-2", "График по поторому включается канал №2, в данном случае это график освещения с экономией, включается при наступлении гражданских сумерек, не горит в промежутке экономии, и отключается с рассветом", 342, 286],
        ["data-ku-3", "В данном варианте на канале №3 графика нет, канал включается только по команде диспетчера", 342, 372],
        ["outputs-ku-1", "Закреплено Реле 1 за Каналом №1, которое физически будет включать КМ-1, по графику освещения (либо по команде диспетчера)", 564, 200],
        ["outputs-ku-2", "Закреплено Реле 2 за Каналом №2, которое физически будет включать КМ-2, по графику освещенияс экономией (либо по команде диспетчера)", 564, 286],
        ["outputs-ku-3", "Закреплено Реле 3 за Каналом №3, которое физически будет включать КМ-3, по команде диспетчера ", 564, 372],
        ["control-1", "Согласно схеме контроль включение КМ-1 подключен к дискрету-3, чтобы правильно отображалось состояние выбран именно тот дискрет который и подключен к КМ управляемым каналом 1", 726, 200],
        ["control-2", "Согласно схеме контроль включение КМ-2 подключен к дискрету-4, чтобы правильно отображалось состояние выбран именно тот дискрет который и подключен к КМ управляемым каналом 2", 726, 286],
        ["control-3", "Согласно схеме контроль включение КМ-3 подключен к дискрету-5, чтобы правильно отображалось состояние выбран именно тот дискрет который и подключен к КМ управляемым каналом 3", 726, 372],
    ].map(([id, label, x, y]) => ({
        id,
        label,
        shape: "rect",
        x,
        y,
        width: id.startsWith("outputs") ? 158 : 218,
        height: 25,
    })),
    ...[
        ["fault-channel-1", "Канал 1, тут отмечены те дискреты, которые подключены к автоматам напряжение на которых появляется напряжение включением первого канала", 12, 347, 274, 55],
        ["fault-channel-2", "Канал 2, тут отмечены те дискреты, которые подключены к автоматам напряжение на  которых появляется напряжение включением второго канала", 12, 433, 274, 55],
        ["fault-control", "Режим управления, отмечен тот дискрет, который под напряжением только тогда, когда ключ в шкафу в положении автоматический режим", 12, 716, 274, 55],
        ["fault-security", "Охрана, отмечен тот дискрет к которому подключен нормально открытый контакт путевого выключателя", 12, 801, 274, 55],
    ].map(([id, label, x, y, width, height]) => ({
        id,
        label,
        shape: "rect",
        x,
        y,
        width,
        height,
    })),
    {
        id: "close",
        label: "Закрыть",
        shape: "close",
        action: "close",
        x: 916,
        y: 0,
        width: 45,
        height: 34,
    },
];

export default function ConfigDeviceModal({ onClose }) {
    return (
        <div className="config-modal" role="dialog" aria-modal="true" aria-label="Конфигурация на устройстве" onMouseDown={onClose}>
            <div className="config-modal__window" onMouseDown={(event) => event.stopPropagation()}>
                <div className="config-modal__body">
                    <div className="config-modal__image-wrap">
                        <img className="config-modal__image" src={configImage} alt="Конфигурация на устройстве" />
                        {CONFIG_HOTSPOTS.map((hotspot) => (
                            <button
                                key={hotspot.id}
                                className={`config-modal__hotspot config-modal__hotspot--${hotspot.shape}`}
                                type="button"
                                aria-label={hotspot.label}
                                onClick={() => {
                                    if (hotspot.action === "close") {
                                        onClose();
                                    }
                                }}
                                style={{
                                    left: `${(hotspot.x / CONFIG_IMAGE_SIZE.width) * 100}%`,
                                    top: `${(hotspot.y / CONFIG_IMAGE_SIZE.height) * 100}%`,
                                    width: `${(hotspot.width / CONFIG_IMAGE_SIZE.width) * 100}%`,
                                    height: `${(hotspot.height / CONFIG_IMAGE_SIZE.height) * 100}%`,
                                }}
                            >
                                <span>{hotspot.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
