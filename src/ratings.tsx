import * as api from "./api";

export function findRatedFolder(contents) {
    return contents.items.find((item) => item.type === "folder" && item.name === "Rated");
}

export function addPlaylistUris(playlistUris, ratedFolder) {
    const newPlaylistUris = {};
    const ratings = ["0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
    const unmappedRatings = ratings.filter((rating) => !playlistUris[rating]);
    ratedFolder.items.filter((item) => unmappedRatings.includes(item.name)).forEach((item) => (newPlaylistUris[item.name] = item.uri));
    return newPlaylistUris;
}

export function getPlaylistNames(playlistUris, ratedFolder) {
    const playlistNames = {};
    ratedFolder.items.filter((item) => playlistUris[item.name]).forEach((item) => (playlistNames[item.uri] = item.name));
    return playlistNames;
}

export async function getAllPlaylistItems(playlistUris) {
    const ratings = Object.keys(playlistUris);
    const allPlaylistItemsArray = await Promise.all(ratings.map((rating) => api.getPlaylistItems(playlistUris[rating])));
    const allPlaylistItems = {};
    for (let i = 0; i < ratings.length; i++) allPlaylistItems[ratings[i]] = allPlaylistItemsArray[i];
    return allPlaylistItems;
}

export function getRatings(allPlaylistItems) {
    const ratings = {};
    for (const [rating, items] of Object.entries(allPlaylistItems)) {
        for (const item of items) {
            const trackUri = item.link;
            let trackRatings = [];
            if (ratings[trackUri]) trackRatings = ratings[trackUri];
            trackRatings.push(rating);
            ratings[trackUri] = trackRatings;
        }
    }
    return ratings;
}

export function takeHighestRatings(ratings) {
    const newRatings = {};
    for (const [trackUri, trackRatings] of Object.entries(ratings)) newRatings[trackUri] = Math.max(...trackRatings);
    return newRatings;
}

export async function deleteLowestRatings(playlistUris, ratings) {
    const promises = [];
    for (const [trackUri, trackRatings] of ratings) {
        if (trackRatings.length <= 1) continue;
        const highestRating = Math.max(...trackRatings);
        trackRatings
            .filter((rating) => rating != highestRating)
            .forEach((rating) => {
                const playlistUri = playlistUris.get(rating);
                console.log(
                    `Removing track ${trackUri} with lower rating ${rating} and higher rating ${highestRating} from lower rated playlist ${playlistUri}.`
                );
                promises.push(api.deleteTrackFromPlaylist(playlistUri, trackUri));
            });
    }
    await Promise.all(promises);
}

export async function createRatedFolder() {
    await api.createFolder("Rated");
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
