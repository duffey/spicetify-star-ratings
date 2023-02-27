import * as api from "./api";

export function getSettings() {
    try {
        const parsed = JSON.parse(api.getLocalStorageData("starRatings:settings"));
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
        throw "";
    } catch {
        api.setLocalStorageData("starRatings:settings", `{}`);
        return {
            halfStarRatings: true,
            likeThreshold: "4.0",
            hideHearts: false,
            enableKeyboardShortcuts: true,
            showPlaylistStars: true,
        };
    }
}

export function saveSettings(settings) {
    api.setLocalStorageData("starRatings:settings", JSON.stringify(settings));
}
