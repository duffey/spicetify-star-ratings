import * as api from "./api";
import { createStars, setRating, getMouseoverRating } from "./stars";
import { getSettings, saveSettings } from "./settings";
import { displaySettings } from "./settings-ui";
import { getRatings, getRatedPlaylists, getAlbumRating } from "./ratings";

let SETTINGS = null;
const fiveColumnGridCss = "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)";
const sixColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)";
const sevenColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)";

let oldTracklist = null;
let tracklist = null;

let oldNowPlayingWidget = null;
let nowPlayingWidget = null;

let oldAlbumPlayButton = null;
let albumPlayButton = null;

let [playlists, ratedFolderUri, ratings] = [null, null, null];
let albumId = null;
let updateNowPlayingWidget = null;
let albumStarData = null;
let nowPlayingWidgetStarData = null;

let tracklistObserver = null;

function getTracklistTrackUri(tracklistElement) {
    let values = Object.values(tracklistElement);
    if (!values) return null;

    return (
        values[0]?.pendingProps?.children[0]?.props?.children?.props?.uri ||
        values[0]?.pendingProps?.children[0]?.props?.children?.props?.children?.props?.uri ||
        values[0]?.pendingProps?.children[0]?.props?.children[0]?.props?.uri
    );
}

function getNowPlayingHeart() {
    return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart");
}

const getNowPlayingTrackUri = () => {
    return Spicetify.Player.data.track.uri;
};

async function updateAlbumRating() {
    if (!albumId) return;
    const album = await api.getAlbum(albumId);
    const averageRating = getAlbumRating(ratings, album);

    setRating(albumStarData[1], averageRating.toString());
}

function getClickListener(i, ratingOverride, starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart) {
    const getCurrentRating = (trackUri) => {
        return ratings[trackUri] ? ratings[trackUri] : "0.0";
    };

    const [stars, starElements] = starData;
    const star = starElements[i][0];

    return async () => {
        const trackUri = getTrackUri();
        const currentRating = getCurrentRating(trackUri);
        let newRating = ratingOverride !== null ? ratingOverride : getMouseoverRating(SETTINGS, star, i);

        const heart = getHeart();
        if (heart && SETTINGS.likeThreshold !== "disabled") {
            if (heart.ariaChecked !== "true" && newRating >= parseFloat(SETTINGS.likeThreshold)) heart.click();
            if (heart.ariaChecked === "true" && newRating < parseFloat(SETTINGS.likeThreshold)) heart.click();
        }

        const removeRating = currentRating === newRating && ratings[trackUri];
        if (removeRating) {
            newRating = "0.0";
        }

        const rating = ratings[trackUri];
        const ratingString = newRating.toString();
        // Do this first because otherwise the track mouseout event will set the track row to hidden again
        ratings[trackUri] = ratingString;

        setRating(starElements, newRating);

        if (rating) {
            const playlistUri = playlists[rating].uri;
            await api.deleteTrackFromPlaylist(playlistUri, trackUri);
            if (removeRating) {
                api.showNotification(`Removed from ${rating}`);
            }
        }

        const playlist = playlists[ratingString];
        let playlistUri = null;

        if (!playlist && !removeRating) {
            if (!ratedFolderUri) {
                await api.createFolder("Rated");
                [playlists, ratedFolderUri] = await getRatedPlaylists();
            }
            playlistUri = await api.createPlaylist(ratingString, ratedFolderUri);
            await api.makePlaylistPrivate(playlistUri);
            [playlists, ratedFolderUri] = await getRatedPlaylists();
        }

        if (!removeRating) {
            playlistUri = playlists[ratingString].uri;
            await api.addTrackToPlaylist(playlistUri, trackUri);
            api.showNotification((rating ? "Moved" : "Added") + ` to ${ratingString}`);
            ratings[trackUri] = ratingString;
        } else {
            delete ratings[trackUri];
        }

        if (doUpdateNowPlayingWidget && updateNowPlayingWidget) {
            updateNowPlayingWidget();
        }

        if (doUpdateTracklist) {
            console.assert(updateTracklist);
            const nowPlayingStars = document.getElementById(`stars-${trackUri}`);
            if (nowPlayingStars) nowPlayingStars.remove();
            await updateTracklist();
        }

        await updateAlbumRating();
    };
}

function registerKeyboardShortcuts(keys) {
    return () => {
        for (const [rating, key] of Object.entries(keys)) {
            Spicetify.Keyboard.registerShortcut(
                {
                    key: key,
                    ctrl: true,
                    alt: true,
                },
                getClickListener(0, rating, nowPlayingWidgetStarData, getNowPlayingTrackUri, false, true, getNowPlayingHeart)
            );
        }
    };
}

function deregisterKeyboardShortcuts(keys) {
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

function addStarsListeners(starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart) {
    const getCurrentRating = (trackUri) => {
        return ratings[trackUri] ? ratings[trackUri] : "0.0";
    };

    const [stars, starElements] = starData;

    stars.addEventListener("mouseout", function () {
        setRating(starElements, getCurrentRating(getTrackUri()));
    });

    for (let i = 0; i < 5; i++) {
        const star = starElements[i][0];

        star.addEventListener("mouseover", function () {
            const rating = getMouseoverRating(SETTINGS, star, i);
            setRating(starElements, rating);
        });

        star.addEventListener("click", getClickListener(i, null, starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart));
    }
}

function updateTracklist() {
    if (!SETTINGS.showPlaylistStars) return;
    const tracklist_ = document.querySelector(".main-trackList-indexable");
    if (!tracklist_) return;
    const tracks = tracklist_.getElementsByClassName("main-trackList-trackListRow");

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
        let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
        let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));

        if (tracklistColumnCss[colIndexInt]) tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
    }

    for (const track of tracks) {
        const getHeart = () => {
            return track.getElementsByClassName("main-addButton-button")[0];
        };
        const heart = track.getElementsByClassName("main-addButton-button")[0];
        const hasStars = track.getElementsByClassName("stars").length > 0;
        const trackUri = getTracklistTrackUri(track);
        const isTrack = trackUri.includes("track");

        let ratingColumn = track.querySelector(".starRatings");
        if (!ratingColumn) {
            // Add column for stars
            let lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
            let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
            lastColumn.setAttribute("aria-colindex", (colIndexInt + 1).toString());
            ratingColumn = document.createElement("div");
            ratingColumn.setAttribute("aria-colindex", colIndexInt.toString());
            ratingColumn.role = "gridcell";
            ratingColumn.style.display = "flex";
            ratingColumn.classList.add("main-trackList-rowSectionVariable");
            ratingColumn.classList.add("starRatings");
            track.insertBefore(ratingColumn, lastColumn);

            if (tracklistColumnCss[colIndexInt]) track.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
        }

        if (!heart || !trackUri || hasStars || !isTrack) continue;

        const starData = createStars(trackUri, 16);
        const stars = starData[0];
        const starElements = starData[1];
        const currentRating = ratings[trackUri] ? ratings[trackUri] : "0.0";
        ratingColumn.appendChild(stars);
        setRating(starElements, currentRating);
        getHeart().style.display = SETTINGS.hideHearts ? "none" : "flex";
        addStarsListeners(
            starData,
            () => {
                return trackUri;
            },
            true,
            false,
            getHeart
        );

        // Add listeners for hovering over a track in the tracklist
        stars.style.visibility = ratings[trackUri] ? "visible" : "hidden";

        track.addEventListener("mouseover", () => {
            stars.style.visibility = "visible";
        });

        track.addEventListener("mouseout", () => {
            stars.style.visibility = ratings[trackUri] ? "visible" : "hidden";
        });
    }
}

async function observerCallback(keys) {
    oldTracklist = tracklist;
    tracklist = document.querySelector(".main-trackList-indexable");
    if (tracklist && !tracklist.isEqualNode(oldTracklist)) {
        if (oldTracklist) {
            tracklistObserver.disconnect();
        }
        updateTracklist();
        tracklistObserver.observe(tracklist, {
            childList: true,
            subtree: true,
        });
    }

    if (getNowPlayingHeart()) getNowPlayingHeart().style.display = SETTINGS.hideHearts ? "none" : "flex";

    oldNowPlayingWidget = nowPlayingWidget;
    nowPlayingWidget = document.querySelector(".main-nowPlayingWidget-nowPlaying .main-trackInfo-container");
    if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
        nowPlayingWidgetStarData = createStars("now-playing", 16);
        nowPlayingWidgetStarData[0].style.marginLeft = "8px";
        nowPlayingWidgetStarData[0].style.marginRight = "8px";
        nowPlayingWidget.after(nowPlayingWidgetStarData[0]);
        addStarsListeners(nowPlayingWidgetStarData, getNowPlayingTrackUri, false, true, getNowPlayingHeart);
        updateNowPlayingWidget();
        if (SETTINGS.enableKeyboardShortcuts) {
            registerKeyboardShortcuts(keys)();
        }
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
        albumId = isAlbumPage();
        if (!albumId) return;
        albumStarData = createStars("album", 32);
        albumPlayButton.after(albumStarData[0]);
        await updateAlbumRating();
    }
}

async function main() {
    while (!Spicetify?.showNotification) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    SETTINGS = getSettings();
    saveSettings(SETTINGS);

    [playlists, ratedFolderUri, ratings] = await getRatings();

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

    new Spicetify.Menu.Item(
        "Star Ratings",
        false,
        displaySettings(SETTINGS, registerKeyboardShortcuts(keys), deregisterKeyboardShortcuts(keys))
    ).register();

    updateNowPlayingWidget = () => {
        if (!nowPlayingWidgetStarData) return;

        const getTrackUri = () => {
            return Spicetify.Player.data.track.uri;
        };
        const trackUri = getTrackUri();
        const isTrack = trackUri.includes("track");

        nowPlayingWidgetStarData[0].style.display = isTrack ? "flex" : "none";

        const currentRating = ratings[trackUri] ? ratings[trackUri] : "0.0";
        setRating(nowPlayingWidgetStarData[1], currentRating);
    };

    tracklistObserver = new MutationObserver(() => {
        updateTracklist();
    });

    Spicetify.Player.addEventListener("songchange", () => {
        updateNowPlayingWidget();
    });

    const observer = new MutationObserver(async () => {
        await observerCallback(keys);
    });
    await observerCallback(keys);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export default main;
