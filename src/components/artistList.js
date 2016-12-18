import React from 'react';


export default class ArtistList extends React.Component {

    constructor(props) {
        super(props);
        console.log("props:", props);
    }

    renderArtistNames() {
        return this.props.artists.map((a, i) => {
            return <div id={`ar-${i}`} key={a.artist} onClick={(event) => this.onClick(event)}>{a.artist}</div>
        })
    }


    render() {
        return (
            <div>
                <h2>Artists</h2>
                {this.renderArtistNames()}
            </div>
        );
    }

    onClick(event) {
        const target = event.target;
        const artistId = target.id;
        const artistIndex = artistId.substring(3);
        console.log("ClickHandler", artistIndex);
        this.props.setArtist(artistIndex);
    }
}