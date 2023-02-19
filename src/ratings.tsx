import * as api from "./api";

function filterRatedPlaylists(playlists) {
    const RATINGS = ["0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
    const result = {};
    for (const playlist of playlists.items) {
        if (!RATINGS.includes(playlist.name)) continue;
        result[playlist.name] = playlist;
    }
    return result;
}

export async function getRatedPlaylists() {
    let playlists = await api.getPlaylists();
    const rated = playlists.items.find((playlist) => playlist.type === "folder" && playlist.name === "Rated");
    if (!rated) {
        return [[], null];
    }
    playlists = rated;
    return [filterRatedPlaylists(playlists), rated.uri];
}

export async function getRatings() {
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
