import { saveSettings } from "./settings";
import "./settings-ui.css";

function displayIcon({ icon, size }) {
    return Spicetify.React.createElement("svg", {
        width: size,
        height: size,
        viewBox: "0 0 16 16",
        fill: "currentColor",
        dangerouslySetInnerHTML: {
            __html: icon,
        },
    });
}

function checkBoxItem({ settings, name, field, onclick }) {
    let [value, setValue] = Spicetify.React.useState(settings[field]);
    return Spicetify.React.createElement(
        "div",
        {
            className: "popup-row",
        },
        Spicetify.React.createElement(
            "label",
            {
                className: "col description",
            },
            name
        ),
        Spicetify.React.createElement(
            "div",
            {
                className: "col action",
            },
            Spicetify.React.createElement(
                "button",
                {
                    className: "checkbox" + (value ? "" : " disabled"),
                    onClick: async () => {
                        let state = !value;
                        settings[field] = state;
                        setValue(state);
                        saveSettings(settings);
                        onclick();
                    },
                },
                Spicetify.React.createElement(displayIcon, {
                    icon: Spicetify.SVGIcons.check,
                    size: 16,
                })
            )
        )
    );
}

function dropDownItem({ settings, name, field, options, onclick }) {
    const [value, setValue] = Spicetify.React.useState(settings[field]);
    return Spicetify.React.createElement(
        "div",
        {
            className: "popup-row",
        },
        Spicetify.React.createElement(
            "label",
            {
                className: "col description",
            },
            name
        ),
        Spicetify.React.createElement(
            "div",
            {
                className: "col action",
            },
            Spicetify.React.createElement(
                "select",
                {
                    value,
                    onChange: async (e) => {
                        setValue(e.target.value);
                        settings[field] = e.target.value;
                        saveSettings(settings);
                        onclick();
                    },
                },
                Object.keys(options).map((item) =>
                    Spicetify.React.createElement(
                        "option",
                        {
                            value: item,
                        },
                        options[item]
                    )
                )
            )
        )
    );
}

function keyboardShortcutDescription(label, numberKey) {
    return Spicetify.React.createElement(
        "li",
        {
            className: "main-keyboardShortcutsHelpModal-sectionItem",
        },
        Spicetify.React.createElement(
            "span",
            {
                className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName",
            },
            label
        ),
        Spicetify.React.createElement(
            "kbd",
            {
                className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key",
            },
            "Ctrl"
        ),
        Spicetify.React.createElement(
            "kbd",
            {
                className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key",
            },
            "Alt"
        ),
        Spicetify.React.createElement(
            "kbd",
            {
                className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key",
            },
            numberKey
        )
    );
}

export function displaySettings(settings, registerKeyboardShortcuts, deregisterKeyboardShortcuts) {
    return () => {
        let settingsContent = Spicetify.React.createElement(
            "div",
            null,
            Spicetify.React.createElement(
                "h2",
                {
                    className: "Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading",
                },
                "Settings"
            ),
            Spicetify.React.createElement(checkBoxItem, {
                settings: settings,
                name: "Half star ratings",
                field: "halfStarRatings",
                onclick: async () => {},
            }),
            Spicetify.React.createElement(checkBoxItem, {
                settings: settings,
                name: "Hide hearts",
                field: "hideHearts",
                onclick: async () => {
                    const nowPlayingWidgetHeart = document.querySelector(".control-button-heart");
                    if (nowPlayingWidgetHeart) nowPlayingWidgetHeart.style.display = settings.hideHearts ? "none" : "flex";
                    const hearts = document.querySelectorAll(".main-trackList-rowHeartButton");
                    for (const heart of hearts) heart.style.display = settings.hideHearts ? "none" : "flex";
                },
            }),
            Spicetify.React.createElement(checkBoxItem, {
                settings,
                settings,
                name: "Enable keyboard shortcuts",
                field: "enableKeyboardShortcuts",
                onclick: async () => {
                    if (settings.enableKeyboardShortcuts) {
                        registerKeyboardShortcuts();
                    } else {
                        deregisterKeyboardShortcuts();
                    }
                },
            }),
            Spicetify.React.createElement(checkBoxItem, {
                settings: settings,
                name: "Show playlist stars",
                field: "showPlaylistStars",
                onclick: async () => {},
            }),
            Spicetify.React.createElement(dropDownItem, {
                settings: settings,
                name: "Auto-like/dislike threshold",
                field: "likeThreshold",
                options: {
                    disabled: "Disabled",
                    "3.0": "3.0",
                    3.5: "3.5",
                    "4.0": "4.0",
                    4.5: "4.5",
                    "5.0": "5.0",
                },
                onclick: async () => {},
            }),
            Spicetify.React.createElement(
                "h2",
                {
                    className: "Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading",
                },
                "Keyboard Shortcuts"
            ),
            Spicetify.React.createElement(
                "ul",
                null,
                keyboardShortcutDescription("Rate current track 0.5 stars", "1"),
                keyboardShortcutDescription("Rate current track 1 star", "2"),
                keyboardShortcutDescription("Rate current track 1.5 stars", "3"),
                keyboardShortcutDescription("Rate current track 2 stars", "4"),
                keyboardShortcutDescription("Rate current track 2.5 stars", "5"),
                keyboardShortcutDescription("Rate current track 3 stars", "6"),
                keyboardShortcutDescription("Rate current track 3.5 stars", "7"),
                keyboardShortcutDescription("Rate current track 4 stars", "8"),
                keyboardShortcutDescription("Rate current track 4.5 stars", "9"),
                keyboardShortcutDescription("Rate current track 5 stars", "0")
            )
        );
        Spicetify.PopupModal.display({
            title: "Star Ratings",
            content: settingsContent,
            isLarge: true,
        });
    };
}
