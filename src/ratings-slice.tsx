import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RatingsState {
    ratings: Record<string, number>;
}

const initialState: RatingsState = {
    ratings: {},
};

export const ratingsSlice = createSlice({
    name: "ratings",
    initialState,
    reducers: {
        initRatings: (state, action: PayloadAction<Record<string, number>>) => {
            state.ratings = action.payload;
        },
        setRating: (state, action: PayloadAction<{ trackUri: string; rating: number }>) => {
            state.ratings[action.payload.trackUri] = action.payload.rating;
        },
        removeRating: (state, action: PayloadAction<string>) => {
            delete state.ratings[action.payload];
        },
    },
});

export const { initRatings, setRating, removeRating } = ratingsSlice.actions;

export default ratingsSlice.reducer;
