import { saveSettings, getSetting, setSetting } from "./settings";

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

function checkBoxItem({ name, field, onclick }) {
    let [value, setValue] = Spicetify.React.useState(getSetting(field));
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
                        setSetting(field, state);
                        setValue(state);
                        saveSettings();
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

function dropDownItem({ name, field, options, onclick }) {
    const [value, setValue] = Spicetify.React.useState(getSetting(field));
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
                        setSetting(field, e.target.value);
                        saveSettings();
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

export function displaySettings(registerKeyboardShortcuts, deregisterKeyboardShortcuts) {
    return () => {
        const style = Spicetify.React.createElement(
            "style",
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
            "div",
            null,
            style,
            Spicetify.React.createElement(
                "h2",
                {
                    className: "Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading",
                },
                "Settings"
            ),
            Spicetify.React.createElement(checkBoxItem, {
                name: "Half star ratings",
                field: "halfStarRatings",
                onclick: async () => {},
            }),
            Spicetify.React.createElement(checkBoxItem, {
                name: "Hide hearts",
                field: "hideHearts",
                onclick: async () => {
                    const nowPlayingWidgetHeart = document.querySelector(".control-button-heart");
                    if (nowPlayingWidgetHeart) nowPlayingWidgetHeart.style.display = getSetting("hideHearts") ? "none" : "flex";
                    const hearts = document.querySelectorAll(".main-trackList-rowHeartButton");
                    for (const heart of hearts) heart.style.display = getSetting("hideHearts") ? "none" : "flex";
                },
            }),
            Spicetify.React.createElement(checkBoxItem, {
                name: "Enable keyboard shortcuts",
                field: "enableKeyboardShortcuts",
                onclick: async () => {
                    if (getSetting("enableKeyboardShortcuts")) {
                        registerKeyboardShortcuts();
                    } else {
                        deregisterKeyboardShortcuts();
                    }
                },
            }),
            Spicetify.React.createElement(checkBoxItem, {
                name: "Show playlist stars",
                field: "showPlaylistStars",
                onclick: async () => {},
            }),
            Spicetify.React.createElement(dropDownItem, {
                name: "Auto-like/dislike threshold",
                field: "likeThreshold",
                options: {
                    disabled: "Disabled",
                    "3.0": "3.0",
                    "3.5": "3.5",
                    "4.0": "4.0",
                    "4.5": "4.5",
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
