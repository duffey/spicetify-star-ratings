import * as api from "./api";

let SETTINGS = null;

export function getSetting(key) {
    return SETTINGS[key];
}

export function setSetting(key, value) {
    SETTINGS[key] = value;
}

export function loadSettings() {
    try {
        const parsed = JSON.parse(api.getLocalStorageData("starRatings:settings"));
        if (parsed && typeof parsed === "object") {
            SETTINGS = parsed;
        }
        throw "";
    } catch {
        api.setLocalStorageData("starRatings:settings", `{}`);
        SETTINGS = {
            halfStarRatings: true,
            likeThreshold: "4.0",
            hideHearts: false,
            enableKeyboardShortcuts: true,
            showPlaylistStars: true,
        };
    }
}

export function saveSettings() {
    api.setLocalStorageData("starRatings:settings", JSON.stringify(SETTINGS));
}
