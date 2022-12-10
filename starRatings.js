// @ts-check
// NAME: Star Ratings
// AUTHOR: Scott Duffey
// VERSION: 1.4.1
// DESCRIPTION: Rate songs with stars and automatically save them to playlists

/// <reference path='../globals.d.ts' />
//

let SETTINGS = null;
const fiveColumnGridCss = '[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)';
const sixColumnGridCss = '[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 1fr [last] minmax(120px,1fr)';
const sevenColumnGridCss = '[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 1fr [last] minmax(120px,1fr)';

async function getLocalStorageData(key) {
    return Spicetify.LocalStorage.get(key);
}

async function setLocalStorageData(key, value) {
    Spicetify.LocalStorage.set(key, value);
}

async function getSettings() {
    try {
        const parsed = JSON.parse(await getLocalStorageData('starRatings:settings'));
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
        throw '';
    } catch {
        await setLocalStorageData('starRatings:settings', `{}`);
        return {
            halfStarRatings: true,
            likeThreshold: '4.0',
            hideHearts: false
        };
    }
}

async function saveSettings() {
    await setLocalStorageData('starRatings:settings', JSON.stringify(SETTINGS));
}

const RATINGS = ['0.0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'];

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
            subtree: true
        });
    });
}

async function showNotification(text) {
    Spicetify.showNotification(text);
}

async function createPlaylist(name, folderUid) {
    return await Spicetify.Platform.RootlistAPI.createPlaylist(name, {
        after: folderUid
    });
}

async function makePlaylistPrivate(playlistUri) {
    try {
        await Spicetify.CosmosAsync.post(`sp://core-playlist/v1/playlist/${playlistUri}/set-base-permission`, {
            permission_level: 'BLOCKED'
        });
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await Spicetify.CosmosAsync.post(`sp://core-playlist/v1/playlist/${playlistUri}/set-base-permission`, {
            permission_level: 'BLOCKED'
        });
    }
}

async function createFolder(name) {
    await Spicetify.Platform.RootlistAPI.createFolder(name);
}

async function getAlbum(albumId) {
    return await Spicetify.CosmosAsync.get(`wg://album/v1/album-app/album/${albumId}/desktop`);
}

async function getPlaylists() {
    return await Spicetify.Platform.RootlistAPI.getContents();
}

async function addTrackToPlaylist(playlistId, trackUri) {
    try {
        await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: [trackUri]
        })
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: [trackUri]
        })
    }
}

async function deleteTrackFromPlaylist(playlistId, trackUri) {
    await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        tracks: [{
            uri: trackUri
        }]
    })
}

async function getPlaylistItems(uri) {
    const result = await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${uri}`);
    return result.items;
}

function filterRatedPlaylists(playlists) {
    const result = {}
    for (const playlist of playlists.items) {
        if (!RATINGS.includes(playlist.name)) continue;
        result[playlist.name] = playlist;
    }
    return result;
}

async function getRatedPlaylists() {
    let playlists = await getPlaylists();
    const rated = playlists.items.find(playlist => playlist.type === 'folder' && playlist.name === 'Rated');
    if (!rated) {
        return [
            [], null
        ];
    }
    playlists = rated;
    return [filterRatedPlaylists(playlists), rated.uid];
}

async function getRatings() {
    const [playlists, ratedFolder] = await getRatedPlaylists()
    const ratings = {};
    for (const rating in playlists) {
        const items = await getPlaylistItems(playlists[rating].uri);
        for (const item of items) {
            const uri = item.link;
            if (!ratings[uri]) {
                ratings[uri] = rating;
            } else {
                const m = parseFloat(rating);
                const n = parseFloat(ratings[uri]);
                const lower = (m < n) ? rating : ratings[uri];
                const higher = (m > n) ? rating : ratings[uri];
                ratings[uri] = higher;
                console.log(`Removing track ${item.name} with lower rating ${lower} and higher rating ${higher} from lower rated playlist ${playlists[lower].name}.`);
                await deleteTrackFromPlaylist(playlistUriToId(playlists[lower].uri), uri);
            }
        }
    }
    return [playlists, ratedFolder, ratings];
}

function playlistUriToId(uri) {
    return uri.match(/spotify:playlist:(.*)/)[1];
}

function createStar(starsId, n, size) {
    const xmlns = 'http://www.w3.org/2000/svg';
    const star = document.createElementNS(xmlns, 'svg');
    const id = `${starsId}-${n}`;
    star.id = id;
    star.style.minHeight = `${size}px`;
    star.style.minWidth = `${size}px`;
    star.setAttributeNS(null, 'width', `${size}px`);
    star.setAttributeNS(null, 'height', `${size}px`);
    star.setAttributeNS(null, 'viewBox', `0 0 32 32`);

    const defs = document.createElementNS(xmlns, 'defs');
    star.append(defs);

    const gradient = document.createElementNS(xmlns, 'linearGradient');
    defs.append(gradient);
    gradient.id = `${id}-gradient`;

    const stopFirst = document.createElementNS(xmlns, 'stop');
    gradient.append(stopFirst);
    stopFirst.id = `${id}-gradient-first`;
    stopFirst.setAttributeNS(null, 'offset', '50%');
    stopFirst.setAttributeNS(null, 'stop-color', 'var(--spice-button-disabled)');

    const stopSecond = document.createElementNS(xmlns, 'stop');
    gradient.append(stopSecond);
    stopSecond.id = `${id}-gradient-second`;
    stopSecond.setAttributeNS(null, 'offset', '50%');
    stopSecond.setAttributeNS(null, 'stop-color', 'var(--spice-button-disabled)');

    const path = document.createElementNS(xmlns, 'path');
    star.append(path);
    path.setAttributeNS(null, 'fill', `url(#${gradient.id})`);
    path.setAttributeNS(null, 'd', 'M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z');

    return [star, stopFirst, stopSecond];
}

function createStars(idSuffix, size) {
    const stars = document.createElement('span');
    const id = `stars-${idSuffix}`;
    stars.className = 'stars';
    stars.id = id;
    stars.style.whiteSpace = 'nowrap';
    stars.style.alignItems = 'center';
    stars.style.display = 'flex';

    const starElements = [];
    for (let i = 0; i < 5; i++) {
        const [star, stopFirst, stopSecond] = createStar(id, i + 1, size);
        stars.append(star);
        starElements.push([star, stopFirst, stopSecond]);
    }

    return [stars, starElements];
}

function getTracklistTrackUri(tracklistElement) {
    let values = Object.values(tracklistElement)
    if (!values) return null;

    return values[0] ?.pendingProps ?.children[0] ?.props ?.children ?.props ?.uri ||
        values[0] ?.pendingProps ?.children[0] ?.props ?.children ?.props ?.children ?.props ?.uri ||
        values[0] ?.pendingProps ?.children[0] ?.props ?.children[0] ?.props ?.uri
}

function setRating(starElements, rating) {
    const halfStars = rating /= 0.5;
    for (let i = 0; i < 5; i++) {
        const stopFirst = starElements[i][1];
        const stopSecond = starElements[i][2];
        stopFirst.setAttributeNS(null, 'stop-color', 'var(--spice-button-disabled)');
        stopSecond.setAttributeNS(null, 'stop-color', 'var(--spice-button-disabled)');
    }
    for (let i = 0; i < halfStars; i++) {
        const j = Math.floor(i / 2);
        const stopFirst = starElements[j][1];
        const stopSecond = starElements[j][2];
        if (i % 2 === 0) {
            stopFirst.setAttributeNS(null, 'stop-color', 'var(--spice-button)');
        } else {
            stopSecond.setAttributeNS(null, 'stop-color', 'var(--spice-button)');
        }
    }
}

function getMouseoverRating(star, i) {
    const rect = star.getBoundingClientRect();
    const offset = event.clientX - rect.left;
    const half = offset > 8 || !SETTINGS.halfStarRatings;
    const zeroStars = i === 0 && offset < 3;
    let rating = i + 1;
    if (!half)
        rating -= 0.5;
    if (zeroStars) {
        rating -= SETTINGS.halfStarRatings ? 0.5 : 1.0;
    }
    return rating.toFixed(1);
}

function displayIcon({
    icon,
    size
}) {
    return Spicetify.React.createElement('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'currentColor',
        dangerouslySetInnerHTML: {
            __html: icon,
        },
    });
}

function checkBoxItem({
    name,
    field,
    onclick
}) {
    let [value, setValue] = Spicetify.React.useState(SETTINGS[field]);
    return Spicetify.React.createElement(
        'div', {
            className: 'popup-row'
        },
        Spicetify.React.createElement('label', {
            className: 'col description'
        }, name),
        Spicetify.React.createElement(
            'div', {
                className: 'col action'
            },
            Spicetify.React.createElement(
                'button', {
                    className: 'checkbox' + (value ? '' : ' disabled'),
                    onClick: async () => {
                        let state = !value;
                        SETTINGS[field] = state;
                        setValue(state);
                        await saveSettings();
                        onclick();
                    },
                },
                Spicetify.React.createElement(displayIcon, {
                    icon: Spicetify.SVGIcons.check,
                    size: 16
                })
            )
        )
    );
}

function dropDownItem({
    name,
    field,
    options,
    onclick
}) {
    const [value, setValue] = Spicetify.React.useState(SETTINGS[field]);
    return Spicetify.React.createElement(
        'div', {
            className: 'popup-row'
        },
        Spicetify.React.createElement('label', {
            className: 'col description'
        }, name),
        Spicetify.React.createElement(
            'div', {
                className: 'col action'
            },
            Spicetify.React.createElement(
                'select', {
                    value,
                    onChange: async (e) => {
                        setValue(e.target.value);
                        SETTINGS[field] = e.target.value;
                        await saveSettings();
                        onclick();
                    },
                },
                Object.keys(options).map((item) =>
                    Spicetify.React.createElement(
                        'option', {
                            value: item,
                        },
                        options[item]
                    )
                )
            )
        )
    );
}

function displaySettings() {
    const style = Spicetify.React.createElement(
        'style',
        null,
        `.popup-row::after {
                    content: "";
                    display: table;
                    clear: both;
                }
                .popup-row .col {
                    display: flex;
                    padding: 10px 0;
                    align-items: center;
                }
                .popup-row .col.description {
                    float: left;
                    padding-right: 15px;
                }
                .popup-row .col.action {
                    float: right;
                    text-align: right;
                }
                .popup-row .div-title {
                    color: var(--spice-text);
                }
                .popup-row .divider {
                    height: 2px;
                    border-width: 0;
                    background-color: var(--spice-button-disabled);
                }
                .popup-row .space {
                    margin-bottom: 20px;
                    visibility: hidden;
                }
                button.checkbox {
                    align-items: center;
                    border: 0px;
                    border-radius: 50%;
                    background-color: rgba(var(--spice-rgb-shadow), 0.7);
                    color: var(--spice-text);
                    cursor: pointer;
                    display: flex;
                    margin-inline-start: 12px;
                    padding: 8px;
                }
                button.checkbox.disabled {
                    color: rgba(var(--spice-rgb-text), 0.3);
                }
                select {
                    color: var(--spice-text);
                    background: rgba(var(--spice-rgb-shadow), 0.7);
                    border: 0;
                    height: 32px;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                .login-button {
                    background-color: var(--spice-button);
                    border-radius: 8px;
                    border-style: none;
                    box-sizing: border-box;
                    color: var(--spice-text);
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                    font-weight: 500;
                    height: 40px;
                    line-height: 20px;
                    list-style: none;
                    margin: 10px;
                    outline: none;
                    padding: 5px 10px;
                    position: relative;
                    text-align: center;
                    text-decoration: none;
                    vertical-align: baseline;
                    touch-action: manipulation;
                }`
    );

    let settingsContent = Spicetify.React.createElement(
        'div',
        null,
        style,
        Spicetify.React.createElement(checkBoxItem, {
            name: 'Half star ratings',
            field: 'halfStarRatings',
            onclick: async () => {},
        }),
        Spicetify.React.createElement(checkBoxItem, {
            name: 'Hide hearts',
            field: 'hideHearts',
            onclick: async () => {
                const nowPlayingWidgetHeart = document.querySelector('.control-button-heart');
                if (nowPlayingWidgetHeart)
                    nowPlayingWidgetHeart.style.display = SETTINGS.hideHearts ? 'none' : 'flex';
                const hearts = document.querySelectorAll('.main-trackList-rowHeartButton');
                for (const heart of hearts)
                    heart.style.display = SETTINGS.hideHearts ? 'none' : 'flex';
            },
        }),
        Spicetify.React.createElement(dropDownItem, {
            name: 'Auto-like/dislike threshold',
            field: 'likeThreshold',
            options: {
                disabled: 'Disabled',
                '3.0': '3.0',
                '3.5': '3.5',
                '4.0': '4.0',
                '4.5': '4.5',
                '5.0': '5.0',
            },
            onclick: async () => {},
        })
    );
    Spicetify.PopupModal.display({
        title: 'Star Ratings',
        content: settingsContent,
    });
}

function getPageType() {
    const pathname = Spicetify.Platform.History.location.pathname;
    let matches = null;
    if (pathname === '/collection/tracks') {
        return ['LIKED_SONGS', null];
    }
    if ((matches = pathname.match(/playlist\/(.*)/))) {
        return ['PLAYLIST', matches[1]];
    }
    if ((matches = pathname.match(/album\/(.*)/))) {
        return ['ALBUM', matches[1]];
    }
    if ((matches = pathname.match(/artist\/([^/]*)$/))) {
        return ['ARTIST', matches[1]];
    }
    if ((matches = pathname.match(/artist\/([^/]*)\/saved/))) {
        return ['ARTIST_LIKED', matches[1]];
    }
    return ['OTHER', null];
}

(async function StarRatings() {
    while (!Spicetify.showNotification) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    SETTINGS = await getSettings();
    await saveSettings();

    new Spicetify.Menu.Item('Star Ratings', false, displaySettings).register();

    let oldTracklist = null;
    let tracklist = null;

    let oldNowPlayingWidget = null;
    let nowPlayingWidget = null;

    let [playlists, ratedFolderUid, ratings] = await getRatings();
    let [pageType, id] = [null, null];
    let updateNowPlayingWidget = null;
    let updateTracklist = null;
    let albumStarData = null;
    let nowPlayingWidgetStarData = null;

    const updateAlbumRating = async () => {
        if (pageType !== 'ALBUM') return;

        [playlists, ratedFolderUid, ratings] = await getRatings();

        const album = await getAlbum(id);
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
        if (numRatings > 0)
            averageRating = sumRatings / numRatings;
        // Round to nearest 0.5
        averageRating = (Math.round(averageRating * 2) / 2).toFixed(1);

        const actionBar = await waitForElement('.main-actionBar-ActionBar');
        const hasStars = actionBar.querySelector('.stars');
        const playButton = actionBar.querySelector('.main-playButton-PlayButton');

        if (!hasStars) {
            albumStarData = createStars('album', 32);
            playButton.after(albumStarData[0]);
        }
        setRating(albumStarData[1], averageRating.toString());
    }

    const addStarsListeners = (starData, getTrackUri, doUpdateNowPlayingWidget, doUpdateTracklist, getHeart) => {
        const getCurrentRating = (trackUri) => {
            return ratings[trackUri] ? ratings[trackUri] : '0.0';
        }

        const [stars, starElements] = starData;

        stars.addEventListener('mouseout', function() {
            setRating(starElements, getCurrentRating(getTrackUri()));
        });

        for (let i = 0; i < 5; i++) {
            const star = starElements[i][0];

            star.addEventListener('mouseover', function() {
                const rating = getMouseoverRating(star, i);
                setRating(starElements, rating);
            });

            star.addEventListener('click', async function() {
                const trackUri = getTrackUri();
                const currentRating = getCurrentRating(trackUri);
                let newRating = getMouseoverRating(star, i);

                const heart = getHeart();
                if (heart && SETTINGS.likeThreshold !== 'disabled') {
                    if (heart.ariaChecked !== 'true' && newRating >= parseFloat(SETTINGS.likeThreshold))
                        heart.click();
                    if (heart.ariaChecked === 'true' && newRating < parseFloat(SETTINGS.likeThreshold))
                        heart.click();
                }

                const removeRating = currentRating === newRating && ratings[trackUri]
                if (removeRating) {
                    newRating = '0.0';
                }

                const rating = ratings[trackUri];
                const ratingString = newRating.toString();
                // Do this first because otherwise the track mouseout event will set the track row to hidden again
                ratings[trackUri] = ratingString;

                setRating(starElements, newRating);

                if (rating) {
                    const playlistUri = playlists[rating].uri;
                    const playlistId = playlistUriToId(playlistUri);
                    await deleteTrackFromPlaylist(playlistId, trackUri);
                    if (removeRating) {
                        showNotification(`Removed from ${rating}`);
                    }
                }

                const playlist = playlists[ratingString];
                let playlistUri = null;

                if (!playlist && !removeRating) {
                    if (!ratedFolderUid) {
                        await createFolder('Rated');
                        [playlists, ratedFolderUid] = await getRatedPlaylists();
                    }
                    playlistUri = await createPlaylist(ratingString, ratedFolderUid);
                    await makePlaylistPrivate(playlistUri);
                    [playlists, ratedFolderUid] = await getRatedPlaylists();
                }

                if (!removeRating) {
                    playlistUri = playlists[ratingString].uri;
                    const playlistId = playlistUriToId(playlistUri);
                    await addTrackToPlaylist(playlistId, trackUri);
                    showNotification((rating ? 'Moved' : 'Added') + ` to ${ratingString}`);
                    ratings[trackUri] = ratingString;
                } else {
                    delete ratings[trackUri];
                }

                if (doUpdateNowPlayingWidget && updateNowPlayingWidget) {
                    updateNowPlayingWidget();
                }

                if (doUpdateTracklist && updateTracklist) {
                    const nowPlayingStars = document.getElementById(`stars-${trackUri}`);
                    if (nowPlayingStars)
                        nowPlayingStars.remove();
                    await updateTracklist();
                }

                await updateAlbumRating();
            });
        }
    }

    updateTracklist = () => {
        const tracklist_ = document.querySelector('.main-trackList-indexable');
        if (!tracklist_) return;
        const tracks = tracklist_.getElementsByClassName('main-trackList-trackListRow');

        const tracklistHeader = document.querySelector('.main-trackList-trackListHeaderRow');
        // No tracklist header on Artist page
        if (tracklistHeader) {
            let lastColumn = tracklistHeader.querySelector('.main-trackList-rowSectionEnd');
            let colIndexInt = parseInt(lastColumn.getAttribute('aria-colindex'));

            switch (colIndexInt) {
                case 4:
                    tracklistHeader.style['grid-template-columns'] = fiveColumnGridCss;
                    break;
                case 5:
                    tracklistHeader.style['grid-template-columns'] = sixColumnGridCss;
                    break;
                case 6:
                    tracklistHeader.style['grid-template-columns'] = sevenColumnGridCss;
                    break;
                default:
                    break;
            }
        }

        for (const track of tracks) {
            const getHeart = () => { return track.getElementsByClassName('main-addButton-button')[0]; };
            const heart = track.getElementsByClassName('main-addButton-button')[0];
            const hasStars = track.getElementsByClassName('stars').length > 0;
            const trackUri = getTracklistTrackUri(track);
            const isTrack = trackUri.includes('track');

            let ratingColumn = track.querySelector('.starRatings');
            if (!ratingColumn) {
                // Add column for stars
                let lastColumn = track.querySelector('.main-trackList-rowSectionEnd');
                let colIndexInt = parseInt(lastColumn.getAttribute('aria-colindex'));
                lastColumn.setAttribute('aria-colindex', (colIndexInt + 1).toString());
                ratingColumn = document.createElement('div');
                ratingColumn.setAttribute('aria-colindex', colIndexInt.toString());
                ratingColumn.role = 'gridcell';
                ratingColumn.style.display = 'flex';
                ratingColumn.classList.add('main-trackList-rowSectionVariable');
                ratingColumn.classList.add('starRatings');
                track.insertBefore(ratingColumn, lastColumn);

                switch (colIndexInt) {
                    case 4:
                        track.style['grid-template-columns'] = fiveColumnGridCss;
                        break;
                    case 5:
                        track.style['grid-template-columns'] = sixColumnGridCss;
                        break;
                    case 6:
                        track.style['grid-template-columns'] = sevenColumnGridCss;
                        break;
                    default:
                        break;
                }
            }

            if (!heart || !trackUri || hasStars || !isTrack) continue;

            const starData = createStars(trackUri, 16);
            const stars = starData[0];
            const starElements = starData[1];
            const currentRating = ratings[trackUri] ? ratings[trackUri] : '0.0';
            ratingColumn.appendChild(stars);
            setRating(starElements, currentRating);
            getHeart().style.display = SETTINGS.hideHearts ? 'none' : 'flex';
            addStarsListeners(starData, () => { return trackUri; }, true, false, getHeart);

            // Add listeners for hovering over a track in the tracklist
            stars.style.visibility = ratings[trackUri] ? 'visible' : 'hidden';

            track.addEventListener('mouseover', () => {
                stars.style.visibility = 'visible';
            });

            track.addEventListener('mouseout', () => {
                stars.style.visibility = ratings[trackUri] ? 'visible' : 'hidden';
            });
        }
    };

    updateNowPlayingWidget = () => {
        if (!nowPlayingWidgetStarData) return;

        const getTrackUri = () => { return Spicetify.Player.data.track.uri; };
        const trackUri = getTrackUri();
        const isTrack = trackUri.includes('track');

        nowPlayingWidgetStarData[0].style.display = isTrack? 'flex' : 'none';

        const currentRating = ratings[trackUri] ? ratings[trackUri] : '0.0';
        setRating(nowPlayingWidgetStarData[1], currentRating);
    };

    const tracklistObserver = new MutationObserver(() => {
        updateTracklist();
    });

    Spicetify.Player.addEventListener('songchange', () => {
        updateNowPlayingWidget();
    });

    const observerCallback = async () => {
        oldTracklist = tracklist;
        tracklist = document.querySelector('.main-trackList-indexable');
        if (tracklist && !tracklist.isEqualNode(oldTracklist)) {
            if (oldTracklist) {
                tracklistObserver.disconnect();
            }
            [pageType, id] = getPageType();

            [playlists, ratedFolderUid, ratings] = await getRatings();
            updateTracklist();
            if (pageType === 'ALBUM')
                await updateAlbumRating();
            tracklistObserver.observe(tracklist, {
                childList: true,
                subtree: true
            });
        }

        const getHeart = () => { return document.querySelector('.main-nowPlayingWidget-nowPlaying .control-button-heart'); };
        if (getHeart())
            getHeart().style.display = SETTINGS.hideHearts ? 'none' : 'flex';

        oldNowPlayingWidget = nowPlayingWidget;
        nowPlayingWidget = document.querySelector('.main-nowPlayingWidget-nowPlaying');
        if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
            console.log('widget changed');
            nowPlayingWidgetStarData = createStars('now-playing', 16);
            nowPlayingWidgetStarData[0].style.marginLeft = '8px';
            nowPlayingWidgetStarData[0].style.marginRight = '8px';
            const trackInfo = await waitForElement('.main-nowPlayingWidget-nowPlaying .main-trackInfo-container');
            trackInfo.after(nowPlayingWidgetStarData[0]);
            const getTrackUri = () => { return Spicetify.Player.data.track.uri; };
            addStarsListeners(nowPlayingWidgetStarData, getTrackUri, false, true, getHeart);
            updateNowPlayingWidget();
        }
    }
    const observer = new MutationObserver(observerCallback);
    await observerCallback();
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
