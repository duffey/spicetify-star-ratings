import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RatingsState {
    ratings: Record<string, number>;
    playlistNames: Record<string, string>;
}

const initialState: RatingsState = {
    ratings: {},
    playlistNames: {},
};

export const ratingsSlice = createSlice({
    name: "ratings",
    initialState,
    reducers: {
        initRatings: (state, action: PayloadAction<{ ratings: Record<string, number>; playlistNames: Record<String, string> }>) => {
            state.ratings = action.payload.ratings;
            state.playlistNames = action.payload.playlistNames;
        },
        setRating: (state, action: PayloadAction<{ trackUri: string; rating: number }>) => {
            state.ratings[action.payload.trackUri] = action.payload.rating;
        },
        removeRating: (state, action: PayloadAction<string>) => {
            delete state.ratings[action.payload];
        },
        setPlaylistName: (state, action: PayloadAction<{ playlistUri: string; playlistName: string }>) => {
            state.playlistNames[action.payload.playlistUri] = action.payload.playlistName;
        },
    },
});

export const { initRatings, setRating, removeRating, setPlaylistName } = ratingsSlice.actions;

export default ratingsSlice.reducer;
