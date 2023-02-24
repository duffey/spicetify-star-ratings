import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface MouseOverTrackState {
    trackUri: string | null;
}

const initialState: MouseOverTrackState = {
    trackUri: null,
};

export const mouseoverTrackSlice = createSlice({
    name: "mouseOverTrack",
    initialState,
    reducers: {
        mouseoverTrack: (state, action: PayloadAction<string>) => {
            state.trackUri = action.payload;
        },
        mouseoutTrack: (state, action: PayloadAction<string>) => {
            state.trackUri = action.payload == state.trackUri ? null : state.trackUri;
        },
    },
});

export const { mouseoverTrack, mouseoutTrack } = mouseoverTrackSlice.actions;

export default mouseoverTrackSlice.reducer;
