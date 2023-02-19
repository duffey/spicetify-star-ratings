import * as api from "./api";
import { createStars } from "./stars";
import { loadSettings, saveSettings, getSetting, setSetting } from "./settings";
import { displaySettings } from "./settings-ui";

async function main() {
    while (!Spicetify?.showNotification) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const fiveColumnGridCss = "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)";
    const sixColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)";
    const sevenColumnGridCss = "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)";

    const RATINGS = ["0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];

    const waitForElement = (selector) => {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        });
    };

    function filterRatedPlaylists(playlists) {
        const result = {};
        for (const playlist of playlists.items) {
            if (!RATINGS.includes(playlist.name)) continue;
            result[playlist.name] = playlist;
        }
        return result;
    }

    async function getRatedPlaylists() {
        let playlists = await api.getPlaylists();
        const rated = playlists.items.find((playlist) => playlist.type === "folder" && playlist.name === "Rated");
        if (!rated) {
            return [[], null];
        }
        playlists = rated;
        return [filterRatedPlaylists(playlists), rated.uri];
    }

    async function getRatings() {
        const [playlists, ratedFolder] = await getRatedPlaylists();
        const ratings = {};
        for (const rating in playlists) {
            const items = await api.getPlaylistItems(playlists[rating].uri);
            for (const item of items) {
                const uri = item.link;
                if (!ratings[uri]) {
                    ratings[uri] = rating;
                } else {
                    const m = parseFloat(rating);
                    const n = parseFloat(ratings[uri]);
                    const lower = m < n ? rating : ratings[uri];
                    const higher = m > n ? rating : ratings[uri];
                    ratings[uri] = higher;
                    console.log(
                        `Removing track ${item.name} with lower rating ${lower} and higher rating ${higher} from lower rated playlist ${playlists[lower].name}.`
                    );
                    await api.deleteTrackFromPlaylist(playlistUriToId(playlists[lower].uri), uri);
                }
            }
        }
        return [playlists, ratedFolder, ratings];
    }

    function playlistUriToId(uri) {
        return uri.match(/spotify:playlist:(.*)/)[1];
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

    function setRating(starElements, rating) {
        const halfStars = (rating /= 0.5);
        for (let i = 0; i < 5; i++) {
            const stopFirst = starElements[i][1];
            const stopSecond = starElements[i][2];
            stopFirst.setAttributeNS(null, "stop-color", "var(--spice-button-disabled)");
            stopSecond.setAttributeNS(null, "stop-color", "var(--spice-button-disabled)");
        }
        for (let i = 0; i < halfStars; i++) {
            const j = Math.floor(i / 2);
            const stopFirst = starElements[j][1];
            const stopSecond = starElements[j][2];
            if (i % 2 === 0) {
                stopFirst.setAttributeNS(null, "stop-color", "var(--spice-button)");
            } else {
                stopSecond.setAttributeNS(null, "stop-color", "var(--spice-button)");
            }
        }
    }

    function getMouseoverRating(star, i) {
        const rect = star.getBoundingClientRect();
        const offset = event.clientX - rect.left;
        const half = offset > 8 || !getSetting("halfStarRatings");
        const zeroStars = i === 0 && offset < 3;
        let rating = i + 1;
        if (!half) rating -= 0.5;
        if (zeroStars) {
            rating -= getSetting("halfStarRatings") ? 0.5 : 1.0;
        }
        return rating.toFixed(1);
    }

    function getPageType() {
        const pathname = Spicetify.Platform.History.location.pathname;
        let matches = null;
        if (pathname === "/collection/tracks") {
            return ["LIKED_SONGS", null];
        }
        if ((matches = pathname.match(/playlist\/(.*)/))) {
            return ["PLAYLIST", matches[1]];
        }
        if ((matches = pathname.match(/album\/(.*)/))) {
            return ["ALBUM", matches[1]];
        }
        if ((matches = pathname.match(/artist\/([^/]*)$/))) {
            return ["ARTIST", matches[1]];
        }
        if ((matches = pathname.match(/artist\/([^/]*)\/saved/))) {
            return ["ARTIST_LIKED", matches[1]];
        }
        return ["OTHER", null];
    }

    loadSettings();
    saveSettings();

    let oldTracklist = null;
    let tracklist = null;

    let oldNowPlayingWidget = null;
    let nowPlayingWidget = null;

    let [playlists, ratedFolderUri, ratings] = await getRatings();
    let [pageType, id] = [null, null];
    let updateNowPlayingWidget = null;
    let updateTracklist = null;
    let albumStarData = null;
    let nowPlayingWidgetStarData = null;

    const getNowPlayingHeart = () => {
        return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart");
    };

    const getNowPlayingTrackUri = () => {
        return Spicetify.Player.data.track.uri;
    };

    const updateAlbumRating = async () => {
        if (pageType !== "ALBUM") return;
        [playlists, ratedFolderUri, ratings] = await getRatings();

        const album = await api.getAlbum(id);
        const tracks = album.discs[0].tracks;
        let sumRatings = 0.0;
        let numRatings = 0;

        for (const track of tracks) {
            const rating = ratings[track.uri];
            if (!rating) continue;
            sumRatings += parseFloat(rating);
            numRatings += 1;
        }

        let averageRating = 0.0;
        if (numRatings > 0) averageRating = sumRatings / numRatings;
        // Round to nearest 0.5
        averageRating = (Math.round(averageRating * 2) / 2).toFixed(1);

        const actionBar = await waitForElement(".main-actionBar-ActionBar");
        const hasStars = actionBar.querySelector(".stars");
        const playButton = actionBar.querySelector(".main-playButton-PlayButton");

        if (!hasStars) {
            albumStarData = createStars("album", 32);
            playButton.after(albumStarData[0]);
        }
        setRating(albumStarData[1], averageRating.toString());
    };

    function getClickListener(i, ratingOverride, starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart) {
        const getCurrentRating = (trackUri) => {
            return ratings[trackUri] ? ratings[trackUri] : "0.0";
        };

        const [stars, starElements] = starData;
        const star = starElements[i][0];

        return async () => {
            const trackUri = getTrackUri();
            const currentRating = getCurrentRating(trackUri);
            let newRating = ratingOverride !== null ? ratingOverride : getMouseoverRating(star, i);

            const heart = getHeart();
            if (heart && getSetting("likeThreshold") !== "disabled") {
                if (heart.ariaChecked !== "true" && newRating >= parseFloat(getSetting("likeThreshold"))) heart.click();
                if (heart.ariaChecked === "true" && newRating < parseFloat(getSetting("likeThreshold"))) heart.click();
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
                const playlistId = playlistUriToId(playlistUri);
                await api.deleteTrackFromPlaylist(playlistId, trackUri);
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
                const playlistId = playlistUriToId(playlistUri);
                await api.addTrackToPlaylist(playlistId, trackUri);
                api.showNotification((rating ? "Moved" : "Added") + ` to ${ratingString}`);
                ratings[trackUri] = ratingString;
            } else {
                delete ratings[trackUri];
            }

            if (doUpdateNowPlayingWidget && updateNowPlayingWidget) {
                updateNowPlayingWidget();
            }

            if (doUpdateTracklist && updateTracklist) {
                const nowPlayingStars = document.getElementById(`stars-${trackUri}`);
                if (nowPlayingStars) nowPlayingStars.remove();
                await updateTracklist();
            }

            await updateAlbumRating();
        };
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

    const registerKeyboardShortcuts = () => {
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

    const deregisterKeyboardShortcuts = () => {
        for (const key of Object.values(keys)) {
            Spicetify.Keyboard._deregisterShortcut({
                key: key,
                ctrl: true,
                alt: true,
            });
        }
    };

    new Spicetify.Menu.Item("Star Ratings", false, displaySettings(registerKeyboardShortcuts, deregisterKeyboardShortcuts)).register();

    const addStarsListeners = (starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart) => {
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
                const rating = getMouseoverRating(star, i);
                setRating(starElements, rating);
            });

            star.addEventListener("click", getClickListener(i, null, starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart));
        }
    };

    updateTracklist = () => {
        if (!getSetting("showPlaylistStars")) return;
        const tracklist_ = document.querySelector(".main-trackList-indexable");
        if (!tracklist_) return;
        const tracks = tracklist_.getElementsByClassName("main-trackList-trackListRow");

        const tracklistHeader = document.querySelector(".main-trackList-trackListHeaderRow");
        // No tracklist header on Artist page
        if (tracklistHeader) {
            let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
            let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));

            switch (colIndexInt) {
                case 4:
                    tracklistHeader.style["grid-template-columns"] = fiveColumnGridCss;
                    break;
                case 5:
                    tracklistHeader.style["grid-template-columns"] = sixColumnGridCss;
                    break;
                case 6:
                    tracklistHeader.style["grid-template-columns"] = sevenColumnGridCss;
                    break;
                default:
                    break;
            }
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

                switch (colIndexInt) {
                    case 4:
                        track.style["grid-template-columns"] = fiveColumnGridCss;
                        break;
                    case 5:
                        track.style["grid-template-columns"] = sixColumnGridCss;
                        break;
                    case 6:
                        track.style["grid-template-columns"] = sevenColumnGridCss;
                        break;
                    default:
                        break;
                }
            }

            if (!heart || !trackUri || hasStars || !isTrack) continue;

            const starData = createStars(trackUri, 16);
            const stars = starData[0];
            const starElements = starData[1];
            const currentRating = ratings[trackUri] ? ratings[trackUri] : "0.0";
            ratingColumn.appendChild(stars);
            setRating(starElements, currentRating);
            getHeart().style.display = getSetting("hideHearts") ? "none" : "flex";
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
    };

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

    const tracklistObserver = new MutationObserver(() => {
        updateTracklist();
    });

    Spicetify.Player.addEventListener("songchange", () => {
        updateNowPlayingWidget();
    });

    const observerCallback = async () => {
        oldTracklist = tracklist;
        tracklist = document.querySelector(".main-trackList-indexable");
        if (tracklist && !tracklist.isEqualNode(oldTracklist)) {
            if (oldTracklist) {
                tracklistObserver.disconnect();
            }
            [pageType, id] = getPageType();
            [playlists, ratedFolderUri, ratings] = await getRatings();
            updateTracklist();
            if (pageType === "ALBUM") await updateAlbumRating();
            tracklistObserver.observe(tracklist, {
                childList: true,
                subtree: true,
            });
        }

        if (getNowPlayingHeart()) getNowPlayingHeart().style.display = getSetting("hideHearts") ? "none" : "flex";

        oldNowPlayingWidget = nowPlayingWidget;
        nowPlayingWidget = document.querySelector(".main-nowPlayingWidget-nowPlaying");
        if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
            nowPlayingWidgetStarData = createStars("now-playing", 16);
            nowPlayingWidgetStarData[0].style.marginLeft = "8px";
            nowPlayingWidgetStarData[0].style.marginRight = "8px";
            const trackInfo = await waitForElement(".main-nowPlayingWidget-nowPlaying .main-trackInfo-container");
            trackInfo.after(nowPlayingWidgetStarData[0]);
            addStarsListeners(nowPlayingWidgetStarData, getNowPlayingTrackUri, false, true, getNowPlayingHeart);
            updateNowPlayingWidget();
            if (getSetting("enableKeyboardShortcuts")) {
                registerKeyboardShortcuts();
            }
        }
    };
    const observer = new MutationObserver(observerCallback);
    await observerCallback();
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export default main;
