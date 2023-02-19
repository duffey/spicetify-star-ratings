export function showNotification(text) {
    Spicetify.showNotification(text);
}

export function getLocalStorageData(key) {
    return Spicetify.LocalStorage.get(key);
}

export function setLocalStorageData(key, value) {
    Spicetify.LocalStorage.set(key, value);
}

export async function createPlaylist(name, folderUri) {
    if (navigator.platform.startsWith("Linux") && navigator.userAgent.includes("Spotify/1.1.84.716")) {
        return await Spicetify.Platform.RootlistAPI.createPlaylist(name, {
            after: folderUri,
        });
    } else {
        return await Spicetify.Platform.RootlistAPI.createPlaylist(name, {
            after: {
                uri: folderUri,
            },
        });
    }
}

export async function makePlaylistPrivate(playlistUri) {
    setTimeout(async () => {
        await Spicetify.CosmosAsync.post(`sp://core-playlist/v1/playlist/${playlistUri}/set-base-permission`, {
            permission_level: "BLOCKED",
        });
    }, 1000);
}

export async function createFolder(name) {
    await Spicetify.Platform.RootlistAPI.createFolder(name, { before: "" });
}

export async function getAlbum(albumId) {
    return await Spicetify.CosmosAsync.get(`wg://album/v1/album-app/album/${albumId}/desktop`);
}

export async function getPlaylists() {
    return await Spicetify.Platform.RootlistAPI.getContents();
}

export async function addTrackToPlaylist(playlistId, trackUri) {
    try {
        await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: [trackUri],
        });
    } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: [trackUri],
        });
    }
}

export async function deleteTrackFromPlaylist(playlistId, trackUri) {
    await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        tracks: [
            {
                uri: trackUri,
            },
        ],
    });
}

export async function getPlaylistItems(uri) {
    const result = await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${uri}`);
    return result.items;
}