import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface NowPlayingTrackState {
    trackUri: string | null;
}

const initialState: NowPlayingTrackState = {
    trackUri: null,
};

export const nowPlayingTrackSlice = createSlice({
    name: "nowPlayingTrack",
    initialState,
    reducers: {
        setNowPlayingTrack: (state, action: PayloadAction<string>) => {
            state.trackUri = action.payload;
        },
    },
});

export const { setNowPlayingTrack } = nowPlayingTrackSlice.actions;

export default nowPlayingTrackSlice.reducer;
