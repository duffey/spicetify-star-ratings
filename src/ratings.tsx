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

function findRatedFolder(contents) {
    return contents.items.find((item) => item.type === "folder" && item.name === "Rated");
}

export async function getRatedPlaylists() {
    const contents = await api.getContents();
    const ratedFolder = findRatedFolder(contents);
    if (!ratedFolder) {
        return [[], null];
    }
    return [filterRatedPlaylists(ratedFolder), ratedFolder.uri];
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
                await api.deleteTrackFromPlaylist(playlists[lower].uri, uri);
            }
        }
    }
    return [playlists, ratedFolder, ratings];
}

export function getAlbumRating(ratings, album) {
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

    return averageRating;
}
