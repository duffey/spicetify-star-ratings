import { configureStore } from "@reduxjs/toolkit";
import ratingsReducer from "./ratings-slice";
import mouseoverTrackReducer from "./mouseover-track-slice";
import nowPlayingTrackReducer from "./now-playing-track-slice";
import settingsReducer from "./settings-slice";

export const store = configureStore({
    reducer: {
        ratings: ratingsReducer,
        mouseoverTrack: mouseoverTrackReducer,
        nowPlayingTrack: nowPlayingTrackReducer,
        settings: settingsReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
