import "./sort-modal.css";

const React = Spicetify.React;

export function Button({ name, className, onButtonClick }) {
    return (
        <button className={className} onClick={onButtonClick}>
            {name}
        </button>
    );
}

export function SortModal({ onClickCancel, onClickOK }) {
    return (
        <div className="encore-light-theme RVgHI2ejYct8LjT1AO7m button-div">
            <p className="Type__TypeElement-sc-goli3j-0 juFXol">
                This will modify the <b>Custom order</b> of the playlist.
            </p>
            <div className="X05XDhpQJ7THPHfgbUk1">
                <Button name="Cancel" className="cancel-button" onButtonClick={onClickCancel} />
                <Button name="Sort" className="ok-button" onButtonClick={onClickOK} />
            </div>
        </div>
    );
}
