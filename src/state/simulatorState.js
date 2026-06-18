export const KEY_MODES = {
    MANUAL: "manual",
    AUTO: "auto",
};

export const initialSimulatorState = {
    qs1: true,
    keyMode: KEY_MODES.AUTO,
    km1: false,
    km2: false,
    km3: false,
    sf: {
        sf1: true,
        sf2: true,
        sf3: true,
        sf4: true,
        sf5: true,
        sf6: true,
        sf7: true,
        sf8: true,
        sf9: true,
        sf10: true,
    },
    mpPressed: false,
};

export function simulatorReducer(state, action) {
    switch (action.type) {
        case "TOGGLE_QS1":
            if (state.qs1) {
                return {
                    ...state,
                    qs1: false,
                    km1: false,
                    km2: false,
                    km3: false,
                };
            }
            return { ...state, qs1: true };

        case "SET_QS1":
            if (!action.payload) {
                return {
                    ...state,
                    qs1: false,
                    km1: false,
                    km2: false,
                    km3: false,
                };
            }
            return { ...state, qs1: true };

        case "SET_KEY_MODE":
            if (action.payload !== KEY_MODES.MANUAL && action.payload !== KEY_MODES.AUTO) {
                return state;
            }
            return { ...state, keyMode: action.payload };

        case "TOGGLE_KM":
            if (!["km1", "km2", "km3"].includes(action.payload)) {
                return state;
            }
            if (!state.sf.sf2 && !state[action.payload]) {
                return state;
            }
            return {
                ...state,
                [action.payload]: !state[action.payload],
            };

        case "SET_KM":
            if (!["km1", "km2", "km3"].includes(action.payload.name)) {
                return state;
            }
            if (!state.sf.sf2 && Boolean(action.payload.value)) {
                return state;
            }
            if (state[action.payload.name] === Boolean(action.payload.value)) {
                return state;
            }
            return {
                ...state,
                [action.payload.name]: Boolean(action.payload.value),
            };

        case "TOGGLE_SF":
            if (!Object.prototype.hasOwnProperty.call(state.sf, action.payload)) {
                return state;
            }
            if (action.payload === "sf2" && state.sf.sf2) {
                return {
                    ...state,
                    km1: false,
                    km2: false,
                    km3: false,
                    sf: {
                        ...state.sf,
                        [action.payload]: false,
                    },
                };
            }
            return {
                ...state,
                sf: {
                    ...state.sf,
                    [action.payload]: !state.sf[action.payload],
                },
            };

        case "SET_SF":
            if (!Object.prototype.hasOwnProperty.call(state.sf, action.payload.name)) {
                return state;
            }
            if (action.payload.name === "sf2" && !action.payload.value) {
                return {
                    ...state,
                    km1: false,
                    km2: false,
                    km3: false,
                    sf: {
                        ...state.sf,
                        [action.payload.name]: false,
                    },
                };
            }
            return {
                ...state,
                sf: {
                    ...state.sf,
                    [action.payload.name]: Boolean(action.payload.value),
                },
            };

        case "SET_MP_PRESSED":
            if (state.mpPressed === Boolean(action.payload)) {
                return state;
            }
            return { ...state, mpPressed: Boolean(action.payload) };

        case "TOGGLE_MP":
            return { ...state, mpPressed: !state.mpPressed };

        default:
            return state;
    }
}

export const simulatorActions = {
    toggleQs1: () => ({ type: "TOGGLE_QS1" }),
    setQs1: (value) => ({ type: "SET_QS1", payload: value }),

    setKeyMode: (mode) => ({ type: "SET_KEY_MODE", payload: mode }),

    toggleKm1: () => ({ type: "TOGGLE_KM", payload: "km1" }),
    toggleKm2: () => ({ type: "TOGGLE_KM", payload: "km2" }),
    toggleKm3: () => ({ type: "TOGGLE_KM", payload: "km3" }),
    setKm1: (value) => ({ type: "SET_KM", payload: { name: "km1", value } }),
    setKm2: (value) => ({ type: "SET_KM", payload: { name: "km2", value } }),
    setKm3: (value) => ({ type: "SET_KM", payload: { name: "km3", value } }),

    toggleSf: (name) => ({ type: "TOGGLE_SF", payload: name }),
    setSf: (name, value) => ({ type: "SET_SF", payload: { name, value } }),

    setMpPressed: (value) => ({ type: "SET_MP_PRESSED", payload: value }),
    toggleMp: () => ({ type: "TOGGLE_MP" }),
};
