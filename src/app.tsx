import * as api from "./api";
import { createStars, setRating, getMouseoverRating, findStars } from "./stars";
import { getSettings, saveSettings, getPlaylistUris, savePlaylistUris, getRatedFolderUri, saveRatedFolderUri } from "./settings";
import { Settings } from "./settings-ui";
import {
    findFolderByName,
    findFolderByUri,
    addPlaylistUris,
    removePlaylistUris,
    getAllPlaylistItems,
    getRatings,
    takeHighestRatings,
    getPlaylistNames,
    deleteLowestRatings,
    getAlbumRating,
} from "./ratings";

let settings = null;

let ratedFolderUri = null;
let ratings = {};
let playlistNames = {};
let playlistUris = {};

let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;
let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];

let oldNowPlayingWidget = null;
let nowPlayingWidget = null;

let oldAlbumPlayButton = null;
let albumPlayButton = null;

let albumId = null;
let album = null;
let albumStarData = null;
let nowPlayingWidgetStarData = null;

let clickListenerRunning = false;

function isAlbumPage() {
    const pathname = Spicetify.Platform.History.location.pathname;
    const matches = pathname.match(/album\/(.*)/);
    if (!matches) return null;
    return matches[1];
}

function trackUriToTrackId(trackUri) {
    return trackUri.match(/spotify:track:(.*)/)[1];
}

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

function updateAlbumRating() {
    if (!albumId) return;
    const averageRating = getAlbumRating(ratings, album);

    setRating(albumStarData[1], averageRating.toString());
}

async function handleRemoveRating(trackUri, rating) {
    delete ratings[trackUri];
    const ratingAsString = rating.toFixed(1);
    const playlistUri = playlistUris[ratingAsString];
    const playlistName = playlistNames[playlistUri];
    await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    api.showNotification(`Removed from ${playlistName}`);
}

async function handleSetRating(trackUri, oldRating, newRating) {
    ratings[trackUri] = newRating;
    if (oldRating) {
        const oldRatingAsString = oldRating.toFixed(1);
        const playlistUri = playlistUris[oldRatingAsString];
        const playlistName = playlistNames[playlistUri];
        await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    }
    if (!ratedFolderUri) {
        await api.createFolder("Rated");
        const contents = await api.getContents();
        const ratedFolder = findFolderByName(contents, "Rated");
        ratedFolderUri = ratedFolder.uri;
        saveRatedFolderUri(ratedFolderUri);
    }
    const newRatingAsString = newRating.toFixed(1);
    let playlistUri = playlistUris[newRatingAsString];
    if (!playlistUri) {
        playlistUri = await api.createPlaylist(newRatingAsString, ratedFolderUri);
        await api.makePlaylistPrivate(playlistUri);
        playlistUris[newRatingAsString] = playlistUri;
        savePlaylistUris(playlistUris);
        playlistNames[playlistUri] = newRatingAsString;
    }
    await api.addTrackToPlaylist(playlistUri, trackUri);
    const playlistName = playlistNames[playlistUri];
    api.showNotification((oldRating ? "Moved" : "Added") + ` to ${playlistName}`);
}

function getClickListener(i, ratingOverride, starData, getTrackUri, getHeart) {
    return () => {
        if (clickListenerRunning) return;
        clickListenerRunning = true;
        const [stars, starElements] = starData;
        const star = starElements[i][0];
        const trackUri = getTrackUri();
        const oldRating = ratings[trackUri];
        let newRating = ratingOverride !== null ? ratingOverride : getMouseoverRating(settings, star, i);

        const heart = getHeart();
        if (heart && settings.likeThreshold !== "disabled") {
            if (heart.ariaChecked !== "true" && newRating >= parseFloat(settings.likeThreshold)) heart.click();
            if (heart.ariaChecked === "true" && newRating < parseFloat(settings.likeThreshold)) heart.click();
        }

        let promise = null;
        let displayRating = null;

        if (oldRating === newRating) {
            displayRating = 0.0;
            promise = handleRemoveRating(trackUri, newRating);
        } else {
            displayRating = newRating;
            promise = handleSetRating(trackUri, oldRating, newRating);
        }

        promise.finally(() => {
            tracklistStarData = findStars(trackUriToTrackId(trackUri));
            if (tracklistStarData) {
                setRating(tracklistStarData[1], displayRating);
                tracklistStarData[0].style.visibility = oldRating === newRating ? "hidden" : "visible";
            }

            updateNowPlayingWidget();
            updateAlbumRating();

            clickListenerRunning = false;
        });
    };
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
                getClickListener(0, parseFloat(rating), nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart)
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

function addStarsListeners(starData, getTrackUri, getHeart) {
    const getCurrentRating = (trackUri) => {
        return ratings[trackUri] ?? 0.0;
    };

    const [stars, starElements] = starData;

    stars.addEventListener("mouseout", function () {
        setRating(starElements, getCurrentRating(getTrackUri()));
    });

    for (let i = 0; i < 5; i++) {
        const star = starElements[i][0];

        star.addEventListener("mousemove", function () {
            const rating = getMouseoverRating(settings, star, i);
            setRating(starElements, rating);
        });

        star.addEventListener("click", getClickListener(i, null, starData, getTrackUri, getHeart));
    }
}

function restoreTracklist() {
    const tracklistHeaders = document.querySelectorAll(".main-trackList-trackListHeaderRow");
    tracklistHeaders.forEach((tracklistHeader) => {
        tracklistHeader.style["grid-template-columns"] = originalTracklistHeaderCss;
    });

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            let ratingColumn = track.querySelector(".starRatings");
            if (!ratingColumn) continue;
            track.style["grid-template-columns"] = originalTracklistTrackCss;
            ratingColumn.remove();
            let lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
            let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
            lastColumn.setAttribute("aria-colindex", (colIndexInt - 1).toString());
        }
    }
}

function updateTracklist() {
    if (!settings.showPlaylistStars) return;

    oldTracklists = tracklists;
    tracklists = Array.from(document.querySelectorAll(".main-trackList-indexable"));
    let tracklistsChanged = tracklists.length !== oldTracklists.length;
    for (let i = 0; i < tracklists.length; i++) if (!tracklists[i].isEqualNode(oldTracklists[i])) tracklistsChanged = true;
    if (tracklistsChanged) {
        originalTracklistHeaderCss = null;
        originalTracklistTrackCss = null;
    }

    const tracklistColumnCss = [
        null,
        null,
        null,
        null,
        "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)",
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)",
    ];

    const tracklistHeaders = document.querySelectorAll(".main-trackList-trackListHeaderRow");
    // No tracklist header on Artist page
    tracklistHeaders.forEach((tracklistHeader) => {
        let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
        let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));

        if (!originalTracklistHeaderCss) originalTracklistHeaderCss = getComputedStyle(tracklistHeader).gridTemplateColumns;
        if (originalTracklistHeaderCss && tracklistColumnCss[colIndexInt])
            tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
    });

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
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

                if (!originalTracklistTrackCss) originalTracklistTrackCss = getComputedStyle(track).gridTemplateColumns;
                if (tracklistColumnCss[colIndexInt]) track.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
            }

            if (!heart || !trackUri || hasStars || !isTrack) continue;

            const starData = createStars(trackUriToTrackId(trackUri), 16);
            const stars = starData[0];
            const starElements = starData[1];
            const currentRating = ratings[trackUri] ?? 0.0;
            ratingColumn.appendChild(stars);
            setRating(starElements, currentRating);
            getHeart().style.display = settings.hideHearts ? "none" : "flex";
            addStarsListeners(
                starData,
                () => {
                    return trackUri;
                },
                getHeart
            );

            // Add listeners for hovering over a track in the tracklist
            stars.style.visibility = typeof ratings[trackUri] !== "undefined" ? "visible" : "hidden";

            track.addEventListener("mouseover", () => {
                stars.style.visibility = "visible";
            });

            track.addEventListener("mouseout", () => {
                stars.style.visibility = typeof ratings[trackUri] !== "undefined" ? "visible" : "hidden";
            });
        }
    }
}

function onClickShowPlaylistStars() {
    if (settings.showPlaylistStars) updateTracklist();
    else restoreTracklist();
}

async function observerCallback(keys) {
    oldMainElement = mainElement;
    mainElement = document.querySelector("main");
    if (mainElement && !mainElement.isEqualNode(oldMainElement)) {
        if (oldMainElement) {
            mainElementObserver.disconnect();
        }
        updateTracklist();
        mainElementObserver.observe(mainElement, {
            childList: true,
            subtree: true,
        });
    }

    if (getNowPlayingHeart()) getNowPlayingHeart().style.display = settings.hideHearts ? "none" : "flex";

    oldNowPlayingWidget = nowPlayingWidget;
    nowPlayingWidget = document.querySelector(".main-nowPlayingWidget-nowPlaying .main-trackInfo-container");
    if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
        nowPlayingWidgetStarData = createStars("now-playing", 16);
        nowPlayingWidgetStarData[0].style.marginLeft = "8px";
        nowPlayingWidgetStarData[0].style.marginRight = "8px";
        nowPlayingWidget.after(nowPlayingWidgetStarData[0]);
        addStarsListeners(nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart);
        updateNowPlayingWidget();
        if (settings.enableKeyboardShortcuts) {
            getRegisterKeyboardShortcuts(keys)();
        }
    }

    oldAlbumPlayButton = albumPlayButton;
    albumPlayButton = document.querySelector(".main-actionBar-ActionBar .main-playButton-PlayButton");
    if (albumPlayButton && !albumPlayButton.isEqualNode(oldAlbumPlayButton)) {
        albumStarData = createStars("album", 32);
        albumPlayButton.after(albumStarData[0]);
        await updateAlbumStars();
        updateAlbumRating();
    }
}

async function updateAlbumStars() {
    if (!albumStarData) return;

    albumId = isAlbumPage();
    albumStarData[0].style.display = albumId ? "flex" : "none";
    if (!albumId) return;
    album = await api.getAlbum(albumId);
    updateAlbumRating();
}

function updateNowPlayingWidget() {
    if (!nowPlayingWidgetStarData) return;

    const getTrackUri = () => {
        return Spicetify.Player.data.track.uri;
    };
    const trackUri = getTrackUri();
    const isTrack = trackUri.includes("track");

    nowPlayingWidgetStarData[0].style.display = isTrack ? "flex" : "none";

    const currentRating = ratings[trackUri] ?? 0.0;
    setRating(nowPlayingWidgetStarData[1], currentRating);
}

function shouldAddContextMenuOnFolders(uri) {
    let uriObj = Spicetify.URI.fromString(uri[0]);
    let { Type } = Spicetify.URI;
    return uriObj.type === Type.FOLDER;
}

async function main() {
    while (!Spicetify?.showNotification) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    settings = getSettings();
    saveSettings(settings);

    ratedFolderUri = getRatedFolderUri();
    ratings = {};
    playlistNames = {};
    playlistUris = getPlaylistUris();
    let ratedFolder = null;

    if (ratedFolderUri) {
        const contents = await api.getContents();
        ratedFolder = findFolderByUri(contents, ratedFolderUri);
    } else {
        // TODO: Remove after next release
        const contents = await api.getContents();
        ratedFolder = findFolderByName(contents, "Rated");
        if (ratedFolder) {
            ratedFolderUri = ratedFolder.uri;
            saveRatedFolderUri(ratedFolderUri);
        }
    }

    if (ratedFolder) {
        let playlistUrisRemoved = false;
        [playlistUrisRemoved, playlistUris] = removePlaylistUris(playlistUris, ratedFolder);

        let playlistUrisAdded = false;
        [playlistUrisAdded, playlistUris] = addPlaylistUris(playlistUris, ratedFolder);

        if (playlistUrisAdded || playlistUrisRemoved) savePlaylistUris(playlistUris);

        const allPlaylistItems = await getAllPlaylistItems(playlistUris);
        ratings = getRatings(allPlaylistItems);
        await deleteLowestRatings(playlistUris, ratings);
        ratings = takeHighestRatings(ratings);
        playlistNames = getPlaylistNames(playlistUris, ratedFolder);
    } else if (Object.keys(playlistUris).length > 0) {
        playlistUris = {};
        savePlaylistUris(playlistUris);
        ratedFolderUri = "";
        saveRatedFolderUri(ratedFolderUri);
    }

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

    new Spicetify.Menu.Item("Star Ratings", false, () => {
        Spicetify.PopupModal.display({
            title: "Star Ratings",
            content: Settings({ settings, registerKeyboardShortcuts, deregisterKeyboardShortcuts, updateTracklist, restoreTracklist }),
            isLarge: true,
        });
    }).register();

    mainElementObserver = new MutationObserver(() => {
        updateTracklist();
    });

    Spicetify.Player.addEventListener("songchange", () => {
        updateNowPlayingWidget();
    });

    Spicetify.Platform.History.listen(async () => {
        await updateAlbumStars();
    });

    new Spicetify.ContextMenu.Item(
        "Use as Rated folder (Requires reload)",
        (uri) => {
            ratedFolderUri = uri;
            saveRatedFolderUri(ratedFolderUri);
            location.reload();
        },
        shouldAddContextMenuOnFolders
    ).register();

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
