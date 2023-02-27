import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "./api";

export interface PlaylistUrisState {
    playlistUris: Record<string, string>;
}

function initialState(): PlaylistUrisState {
    let playlistUris = {};

    const localStorageData = api.getLocalStorageData("starRatings:playlistUris");
    if (localStorageData) {
        playlistUris = JSON.parse(localStorageData);
    } else {
        api.setLocalStorageData("starRatings:playlistUris", JSON.stringify(playlistUris));
    }

    return {
        playlistUris: playlistUris,
    };
}

export const playlistUrisSlice = createSlice({
    name: "playlistUris",
    initialState,
    reducers: {
        initPlaylistUris: (state, action: PayloadAction<Record<string, string>>) => {
            state.playlistUris = action.payload;
            api.setLocalStorageData("starRatings:playlistUris", JSON.stringify(state.playlistUris));
        },
        setPlaylistUri: (state, action: PayloadAction<{ rating: string; playlistUri: string }>) => {
            state.playlistUris[action.payload.rating] = action.payload.playlistUri;
            api.setLocalStorageData("starRatings:playlistUris", JSON.stringify(state.playlistUris));
        },
    },
});

export const { initPlaylistUris, setPlaylistUri } = playlistUrisSlice.actions;

export default playlistUrisSlice.reducer;
