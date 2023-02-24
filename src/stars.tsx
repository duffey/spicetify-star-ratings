import React from "react";
import { useState } from "react";
import type { RootState } from "./store";
import { useSelector } from "react-redux";
import { getAlbumRating } from "./ratings";

export function Star({ i, id, fillFirstHalf, fillSecondHalf, size, onStarMouseMove, onStarClick }) {
    const halfStarRatings = useSelector((state: RootState) => state.settings.settings.halfStarRatings);

    function getMouseOverRating(event) {
        const rect = event.target.getBoundingClientRect();
        const offset = event.clientX - rect.left;
        const half = offset > 8 || !halfStarRatings;
        const zeroStars = i === 0 && offset < 3;
        let rating = i + 1;
        if (!half) rating -= 0.5;
        if (zeroStars) {
            rating -= halfStarRatings ? 0.5 : 1.0;
        }
        return rating;
    }

    function handleMouseMove(event) {
        onStarMouseMove(getMouseOverRating(event));
    }

    function handleClick(event) {
        onStarClick(getMouseOverRating(event));
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 32 32"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <defs>
                <linearGradient id={`grad-${id}-${i}`}>
                    <stop offset="50%" stop-color={fillFirstHalf ? "var(--spice-button)" : "var(--spice-button-disabled)"} />
                    <stop offset="50%" stop-color={fillSecondHalf ? "var(--spice-button)" : "var(--spice-button-disabled)"} />
                </linearGradient>
            </defs>
            <path
                fill={`url(#grad-${id}-${i})`}
                d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118
        l11.547-1.2L16.026,0.6L20.388,10.918z"
            />
        </svg>
    );
}

function fillFirstHalf(i, rating) {
    return 2 * rating > 2 * i;
}

function fillSecondHalf(i, rating) {
    return 2 * rating > 2 * i + 1;
}

export function TracklistStars({ trackUri, heart, onStarsClick }) {
    const trackId = trackUri.match(/spotify:track:(.*)/)[1];
    const hasRating = useSelector((state: RootState) => state.ratings.ratings.hasOwnProperty(trackUri));
    const rating = useSelector((state: RootState) => state.ratings.ratings[trackUri] ?? 0.0);
    const mouseoverTrackUri = useSelector((state: RootState) => state.mouseoverTrack.trackUri);
    const showPlaylistStars = useSelector((state: RootState) => state.settings.settings.showPlaylistStars);
    const [mouseOverRating, setMouseOverRating] = useState(null);
    const displayRating = mouseOverRating ?? rating;

    function handleMouseMove(rating) {
        setMouseOverRating(rating);
    }

    function handleClick(rating) {
        onStarsClick(trackUri, rating, heart);
        setMouseOverRating(null);
    }

    function handleMouseLeave() {
        setMouseOverRating(null);
    }

    function visibility() {
        return showPlaylistStars && (hasRating || mouseoverTrackUri === trackUri) ? "visible" : "hidden";
    }

    const stars = [];
    for (let i = 0; i < 5; i++)
        stars.push(
            <Star
                i={i}
                id={`stars-${trackId}`}
                fillFirstHalf={fillFirstHalf(i, displayRating)}
                fillSecondHalf={fillSecondHalf(i, displayRating)}
                size="16"
                onStarMouseMove={handleMouseMove}
                onStarClick={handleClick}
            />
        );
    return (
        <span
            style={{
                lineHeight: 1.0,
                visibility: visibility(),
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
            }}
            onMouseLeave={handleMouseLeave}
        >
            {stars}
        </span>
    );
}

export function NowPlayingStars({ getHeart, onStarsClick }) {
    const trackUri = useSelector((state: RootState) => state.nowPlayingTrack.trackUri);
    const rating = useSelector((state: RootState) => state.ratings.ratings[trackUri] ?? 0.0);
    const [mouseOverRating, setMouseOverRating] = useState(null);
    const isTrack = trackUri.includes("track");
    const display = isTrack ? "flex" : "none";
    const displayRating = mouseOverRating ?? rating;

    function handleMouseMove(rating) {
        setMouseOverRating(rating);
    }

    function handleClick(rating) {
        onStarsClick(trackUri, rating, getHeart());
        setMouseOverRating(null);
    }

    function handleMouseLeave() {
        setMouseOverRating(null);
    }

    const stars = [];
    for (let i = 0; i < 5; i++)
        stars.push(
            <Star
                i={i}
                id="stars-now-playing"
                size="16"
                fillFirstHalf={fillFirstHalf(i, displayRating)}
                fillSecondHalf={fillSecondHalf(i, displayRating)}
                onStarMouseMove={handleMouseMove}
                onStarClick={handleClick}
            />
        );
    return (
        <span
            style={{
                lineHeight: 1.0,
                marginLeft: 8,
                marginRight: 8,
                whiteSpace: "nowrap",
                display: display,
                alignItems: "center",
            }}
            onMouseLeave={handleMouseLeave}
        >
            {stars}
        </span>
    );
}

export function AlbumStars({ album }) {
    const ratings = useSelector((state: RootState) => state.ratings.ratings);

    const stars = [];
    for (let i = 0; i < 5; i++)
        stars.push(
            <Star
                i={i}
                id="stars-album"
                size="32"
                fillFirstHalf={fillFirstHalf(i, getAlbumRating(ratings, album))}
                fillSecondHalf={fillSecondHalf(i, getAlbumRating(ratings, album))}
                onStarMouseMove={() => {}}
                onStarClick={() => {}}
            />
        );
    return (
        <span
            style={{
                lineHeight: 1.0,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
            }}
        >
            {stars}
        </span>
    );
}
