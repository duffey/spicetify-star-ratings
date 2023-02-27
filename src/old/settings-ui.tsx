import React from "react";
import { useState } from "react";
import { store } from "./store";
import type { RootState } from "./store";
import { Provider, useSelector, useDispatch } from "react-redux";
import { setSetting } from "./settings-slice";
import "./settings-ui.css";

function CheckboxIcon() {
    return (
        <svg
            width={16}
            height={16}
            viewbox="0 0 16 16"
            fill="currentColor"
            dangerouslySetInnerHTML={{
                __html: Spicetify.SVGIcons.check,
            }}
        ></svg>
    );
}

function CheckboxItem({ name, field, onCheckboxClick }) {
    const checked = useSelector((state: RootState) => state.settings.settings[field]);
    const dispatch = useDispatch();
    const buttonClass = checked ? "checkbox" : "checkbox disabled";

    function handleOnClick() {
        const newValue = !checked;
        dispatch(setSetting({ setting: field, value: newValue }));
        if (onCheckboxClick) onCheckboxClick(newValue);
    }

    return (
        <div className="popup-row">
            <label className="col description">{name}</label>
            <div className="col action">
                <button className={buttonClass} onClick={handleOnClick}>
                    <CheckboxIcon />
                </button>
            </div>
        </div>
    );
}

function DropdownItem({ name, field, options }) {
    const value = useSelector((state: RootState) => state.settings.settings[field]);
    const dispatch = useDispatch();

    function handleOnChange(event) {
        dispatch(setSetting({ setting: field, value: event.target.value }));
    }

    const optionElements = [];
    for (const [optionName, optionValue] of Object.entries(options)) optionElements.push(<option value={optionValue}>{optionName}</option>);

    return (
        <div className="popup-row">
            <label className="col description">{name}</label>
            <div className="col action">
                <select value={value} onChange={handleOnChange}>
                    {optionElements}
                </select>
            </div>
        </div>
    );
}

function KeyboardShortcutDescription({ label, numberKey }) {
    return (
        <li className="main-keyboardShortcutsHelpModal-sectionItem">
            <span className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName">{label}</span>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">Ctrl</kbd>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">Alt</kbd>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">{numberKey}</kbd>
        </li>
    );
}

function Heading({ value }) {
    return <h2 className="Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading">{value}</h2>;
}

export function Settings({ registerKeyboardShortcuts, deregisterKeyboardShortcuts, updateTracklist, restoreTracklist }) {
    function handleHideHeartsCheckboxClick(hideHearts) {
        const nowPlayingWidgetHeart = document.querySelector(".control-button-heart");
        if (nowPlayingWidgetHeart) nowPlayingWidgetHeart.style.display = hideHearts ? "none" : "flex";
        const hearts = document.querySelectorAll(".main-trackList-rowHeartButton");
        for (const heart of hearts) heart.style.display = hideHearts ? "none" : "flex";
    }

    function handleEnableKeyboardShortcutsCheckboxClick(enableKeyboardShortcuts) {
        if (enableKeyboardShortcuts) registerKeyboardShortcuts();
        else deregisterKeyboardShortcuts();
    }

    function handleShowPlaylistStarsCheckboxClick(showPlaylistStars) {
        if (showPlaylistStars) updateTracklist();
        else restoreTracklist();
    }

    return (
        <Provider store={store}>
            <div>
                <Heading value="Settings" />
                <CheckboxItem name="Half star ratings" field="halfStarRatings" />
                <CheckboxItem name="Hide hearts" field="hideHearts" onCheckboxClick={handleHideHeartsCheckboxClick} />
                <CheckboxItem
                    name="Enable keyboard shortcuts"
                    field="enableKeyboardShortcuts"
                    onCheckboxClick={handleEnableKeyboardShortcutsCheckboxClick}
                />
                <CheckboxItem name="Show playlist stars" field="showPlaylistStars" onCheckboxClick={handleShowPlaylistStarsCheckboxClick} />
                <DropdownItem
                    name="Auto-like/dislike threshold"
                    field="likeThreshold"
                    options={{
                        disabled: "Disabled",
                        "3.0": "3.0",
                        "3.5": "3.5",
                        "4.0": "4.0",
                        "4.5": "4.5",
                        "5.0": "5.0",
                    }}
                />
                <Heading value="Keyboard Shortcuts" />
                <ul>
                    <KeyboardShortcutDescription label="Rate current track 0.5 stars" numberKey="1" />
                    <KeyboardShortcutDescription label="Rate current track 1 star" numberKey="2" />
                    <KeyboardShortcutDescription label="Rate current track 1.5 stars" numberKey="3" />
                    <KeyboardShortcutDescription label="Rate current track 2 stars" numberKey="4" />
                    <KeyboardShortcutDescription label="Rate current track 2.5 stars" numberKey="5" />
                    <KeyboardShortcutDescription label="Rate current track 3 stars" numberKey="6" />
                    <KeyboardShortcutDescription label="Rate current track 3.5 stars" numberKey="7" />
                    <KeyboardShortcutDescription label="Rate current track 4 stars" numberKey="8" />
                    <KeyboardShortcutDescription label="Rate current track 4.5 stars" numberKey="9" />
                    <KeyboardShortcutDescription label="Rate current track 5 stars" numberKey="0" />
                </ul>
            </div>
        </Provider>
    );
}
