import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "./api";

export interface SettingsState {
    settings: {
        halfStarRatings: boolean;
        likeThreshold: string;
        hideHearts: boolean;
        enableKeyboardShortcuts: boolean;
        showPlaylistStars: true;
        playlistUris: Record<string, string>;
    };
}

function initialState(): SettingsState {
    const defaultSettings = {
        halfStarRatings: true,
        likeThreshold: "4.0",
        hideHearts: false,
        enableKeyboardShortcuts: true,
        showPlaylistStars: true,
        playlistUris: {},
    };
    let settings = {};

    const parsed = JSON.parse(api.getLocalStorageData("starRatings:settings"));
    if (parsed && typeof parsed === "object") settings = parsed;
    let setDefault = false;
    for (const [setting, defaultValue] of Object.entries(defaultSettings))
        if (!settings.hasOwnProperty(setting)) {
            settings[setting] = defaultValue;
            setDefault = true;
        }
    if (setDefault) api.setLocalStorageData("starRatings:settings", JSON.stringify(settings));
    return {
        settings: settings,
    };
}

export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setSetting: (state, action: PayloadAction<{ setting: string; value: string | boolean | number }>) => {
            state.settings[action.payload.setting] = action.payload.value;
            api.setLocalStorageData("starRatings:settings", JSON.stringify(state.settings));
        },
    },
});

export const { setSetting } = settingsSlice.actions;

export default settingsSlice.reducer;
