import React from "react";
import ReactDOM from "react-dom";
import * as api from "./api";
import { TracklistStars, NowPlayingStars, AlbumStars } from "./stars";
import { Settings } from "./settings-ui";
import { store } from "./store";
import { Provider } from "react-redux";
import {
    findRatedFolder,
    addPlaylistUris,
    getAllPlaylistItems,
    getRatings,
    takeHighestRatings,
    getPlaylistNames,
    createRatedFolder,
    deleteLowestRatings,
} from "./ratings";
import { initRatings, setRating, removeRating } from "./ratings-slice";
import { mouseoverTrack, mouseoutTrack } from "./mouseover-track-slice";
import { setNowPlayingTrack } from "./now-playing-track-slice";
import { setSetting } from "./settings-slice";

let ratedFolder = null;
let playlistUris = {};
let playlistNames = {};

let tracklistObserver = null;

let oldTracklist = null;
let tracklist = null;
let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;

let oldNowPlayingWidget = null;
let nowPlayingWidget = null;

let oldAlbumPlayButton = null;
let albumPlayButton = null;

let handleStarsClickRunning = false;

function getNowPlayingHeart() {
    return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart");
}

function getNowPlayingTrackUri() {
    return Spicetify.Player.data.track.uri;
}

async function handleRemoveRating(trackUri, rating) {
    const ratingAsString = rating.toFixed(1);
    const playlistUri = playlistUris[ratingAsString];
    const playlistName = playlistNames[playlistUri];
    await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    api.showNotification(`Removed from ${playlistName}`);
}

async function handleSetRating(trackUri, oldRating, newRating) {
    if (oldRating) {
        const oldRatingAsString = oldRating.toFixed(1);
        const playlistUri = playlistUris[oldRatingAsString];
        await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    }

    if (!ratedFolder) {
        await createRatedFolder();
        const contents = await api.getContents();
        ratedFolder = findRatedFolder(contents);
    }

    const newRatingAsString = newRating.toFixed(1);
    let playlistUri = playlistUris[newRatingAsString];
    if (!playlistUri) {
        playlistUri = await api.createPlaylist(newRatingAsString, ratedFolder.uri);
        await api.makePlaylistPrivate(playlistUri);
        playlistUris[newRatingAsString] = playlistUri;
        playlistNames[playlistUri] = newRatingAsString;
    }

    await api.addTrackToPlaylist(playlistUri, trackUri);
    const playlistName = playlistNames[playlistUri];
    api.showNotification((oldRating ? "Moved" : "Added") + ` to ${playlistName}`);
}

function handleStarsClick(trackUri, newRating, heart) {
    if (handleStarsClickRunning) return;
    handleStarsClickRunning = true;

    const likeThreshold = store.getState().settings.settings.likeThreshold;
    if (likeThreshold !== "disabled") {
        const likeThresholdAsFloat = parseFloat(likeThreshold);
        if (heart.ariaChecked !== "true" && newRating >= likeThresholdAsFloat) heart.click();
        if (heart.ariaChecked === "true" && newRating < likeThresholdAsFloat) heart.click();
    }

    const ratings = store.getState().ratings.ratings;
    const oldRating = ratings[trackUri];

    if (oldRating == newRating) {
        store.dispatch(removeRating(trackUri));
        handleRemoveRating(trackUri, oldRating).finally(() => {
            handleStarsClickRunning = false;
        });
    } else {
        store.dispatch(setRating({ trackUri: trackUri, rating: newRating }));
        handleSetRating(trackUri, oldRating, newRating).finally(() => {
            handleStarsClickRunning = false;
        });
    }
}

function getRegisterKeyboardShortcuts(keys) {
    return () => {
        for (const [rating, key] of Object.entries(keys)) {
            Spicetify.Keyboard.registerShortcut(
                {
                    key: key,
                    ctrl: true,
                    alt: true,
                },
                () => {
                    handleStarsClick(getNowPlayingTrackUri(), parseFloat(rating), getNowPlayingHeart());
                }
            );
        }
    };
}

function getDeregisterKeyboardShortcuts(keys) {
    return () => {
        for (const key of Object.values(keys)) {
            Spicetify.Keyboard._deregisterShortcut({
                key: key,
                ctrl: true,
                alt: true,
            });
        }
    };
}

function restoreTracklist() {
    const restoreTracklistHeader = () => {
        if (!tracklist) return;
        const tracklistHeader = document.querySelector(".main-trackList-trackListHeaderRow");
        if (!tracklistHeader) return;
        if (!originalTracklistHeaderCss) return;
        tracklistHeader.style["grid-template-columns"] = originalTracklistHeaderCss;
    };

    const restoreTracklistTracks = () => {
        if (!tracklist) return;
        if (!originalTracklistTrackCss) return;
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            let ratingColumn = track.querySelector(".star-ratings");
            if (!ratingColumn) continue;
            const lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
            const colIndexAsInt = parseInt(lastColumn.getAttribute("aria-colindex"));
            lastColumn.setAttribute("aria-colindex", (colIndexAsInt - 1).toString());
            track.style["grid-template-columns"] = originalTracklistTrackCss;
            ratingColumn.remove();
        }
    };

    restoreTracklistHeader();
    restoreTracklistTracks();
}

function updateTracklist() {
    if (!store.getState().settings.settings.showPlaylistStars) return;

    const tracklistColumnCss = [
        null,
        null,
        null,
        null,
        "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)",
    ];

    const tracklistHeader = document.querySelector(".main-trackList-trackListHeaderRow");
    // No tracklist header on Artist page
    if (tracklistHeader) {
        const lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
        const colIndexAsInt = parseInt(lastColumn.getAttribute("aria-colindex"));

        if (tracklistColumnCss[colIndexAsInt]) {
            if (!originalTracklistHeaderCss) {
                originalTracklistHeaderCss = getComputedStyle(tracklistHeader).getPropertyValue("grid-template-columns");
            }
            tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexAsInt];
        }
    }

    const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");

    for (const track of tracks) {
        const getHeart = () => {
            return track.getElementsByClassName("main-addButton-button")[0];
        };
        const heart = track.getElementsByClassName("main-addButton-button")[0];
        const hasStars = track.getElementsByClassName("stars").length > 0;

        const getTracklistTrackUri = (tracklistElement) => {
            let values = Object.values(tracklistElement);
            if (!values) return null;

            return (
                values[0]?.pendingProps?.children[0]?.props?.children?.props?.uri ||
                values[0]?.pendingProps?.children[0]?.props?.children?.props?.children?.props?.uri ||
                values[0]?.pendingProps?.children[0]?.props?.children[0]?.props?.uri
            );
        };

        const trackUri = getTracklistTrackUri(track);
        const isTrack = trackUri.includes("track");
        let ratingColumn = track.querySelector(".star-ratings");

        if (!ratingColumn) {
            const lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
            const colIndexAsInt = parseInt(lastColumn.getAttribute("aria-colindex"));
            lastColumn.setAttribute("aria-colindex", (colIndexAsInt + 1).toString());
            ratingColumn = document.createElement("div");
            ratingColumn.setAttribute("aria-colindex", colIndexAsInt.toString());
            ratingColumn.role = "gridcell";
            ratingColumn.style.display = "flex";
            ratingColumn.classList.add("main-trackList-rowSectionVariable");
            ratingColumn.classList.add("star-ratings");
            track.insertBefore(ratingColumn, lastColumn);

            if (tracklistColumnCss[colIndexAsInt]) {
                if (!originalTracklistTrackCss) {
                    originalTracklistTrackCss = getComputedStyle(track).getPropertyValue("grid-template-columns");
                }
                track.style["grid-template-columns"] = tracklistColumnCss[colIndexAsInt];
            }
        }

        if (!heart || !trackUri || hasStars || !isTrack) continue;

        ReactDOM.render(
            <Provider store={store}>
                <TracklistStars trackUri={trackUri} heart={heart} onStarsClick={handleStarsClick} />
            </Provider>,
            ratingColumn
        );

        heart.style.display = store.getState().settings.settings.hideHearts ? "none" : "flex";

        track.addEventListener("mouseover", () => {
            store.dispatch(mouseoverTrack(trackUri));
        });

        track.addEventListener("mouseout", () => {
            store.dispatch(mouseoutTrack(trackUri));
        });
    }
}

async function globalObserverCallback() {
    oldTracklist = tracklist;
    tracklist = document.querySelector(".main-trackList-indexable");
    if (tracklist && !tracklist.isEqualNode(oldTracklist)) {
        if (oldTracklist) {
            tracklistObserver.disconnect();
        }
        originalTracklistHeaderCss = null;
        originalTracklistTrackCss = null;
        updateTracklist();
        tracklistObserver.observe(tracklist, {
            childList: true,
            subtree: true,
        });
    }

    oldNowPlayingWidget = nowPlayingWidget;
    nowPlayingWidget = document.querySelector(".main-nowPlayingWidget-nowPlaying .main-trackInfo-container");
    if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
        store.dispatch(setNowPlayingTrack(getNowPlayingTrackUri()));

        const span = document.createElement("span");
        nowPlayingWidget.after(span);

        ReactDOM.render(
            <Provider store={store}>
                <NowPlayingStars getHeart={getNowPlayingHeart} onStarsClick={handleStarsClick} />
            </Provider>,
            span
        );
    }

    oldAlbumPlayButton = albumPlayButton;
    albumPlayButton = document.querySelector(".main-actionBar-ActionBar .main-playButton-PlayButton");
    if (albumPlayButton && !albumPlayButton.isEqualNode(oldAlbumPlayButton)) {
        const isAlbumPage = () => {
            const pathname = Spicetify.Platform.History.location.pathname;
            const matches = pathname.match(/album\/(.*)/);
            if (!matches) return null;
            return matches[1];
        };

        const albumId = isAlbumPage();
        if (!albumId) return;

        const album = await api.getAlbum(albumId);

        const span = document.createElement("span");
        albumPlayButton.after(span);

        ReactDOM.render(
            <Provider store={store}>
                <AlbumStars album={album} />
            </Provider>,
            span
        );
    }
}

async function main() {
    while (!Spicetify?.showNotification) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const contents = await api.getContents();
    ratedFolder = findRatedFolder(contents);
    let ratings = {};

    if (ratedFolder) {
        playlistUris = addPlaylistUris({}, ratedFolder);
        const allPlaylistItems = await getAllPlaylistItems(playlistUris);
        ratings = getRatings(allPlaylistItems);
        await deleteLowestRatings(playlistUris, ratings);
        ratings = takeHighestRatings(ratings);
        playlistNames = getPlaylistNames(playlistUris, ratedFolder);
    }

    store.dispatch(initRatings(ratings));

    const keys = {
        "5.0": Spicetify.Keyboard.KEYS.NUMPAD_0,
        "0.5": Spicetify.Keyboard.KEYS.NUMPAD_1,
        "1.0": Spicetify.Keyboard.KEYS.NUMPAD_2,
        "1.5": Spicetify.Keyboard.KEYS.NUMPAD_3,
        "2.0": Spicetify.Keyboard.KEYS.NUMPAD_4,
        "2.5": Spicetify.Keyboard.KEYS.NUMPAD_5,
        "3.0": Spicetify.Keyboard.KEYS.NUMPAD_6,
        "3.5": Spicetify.Keyboard.KEYS.NUMPAD_7,
        "4.0": Spicetify.Keyboard.KEYS.NUMPAD_8,
        "4.5": Spicetify.Keyboard.KEYS.NUMPAD_9,
    };
    const registerKeyboardShortcuts = getRegisterKeyboardShortcuts(keys);
    const deregisterKeyboardShortcuts = getDeregisterKeyboardShortcuts(keys);

    if (store.getState().settings.settings.enableKeyboardShortcuts) registerKeyboardShortcuts();

    new Spicetify.Menu.Item("Star Ratings", false, () => {
        Spicetify.PopupModal.display({
            title: "Star Ratings",
            content: Settings({ registerKeyboardShortcuts, deregisterKeyboardShortcuts, updateTracklist, restoreTracklist }),
            isLarge: true,
        });
    }).register();

    Spicetify.Player.addEventListener("songchange", () => {
        store.dispatch(setNowPlayingTrack(getNowPlayingTrackUri()));
    });

    tracklistObserver = new MutationObserver(() => {
        updateTracklist();
    });

    const globalObserver = new MutationObserver(globalObserverCallback);
    await globalObserverCallback();
    globalObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export default main;
