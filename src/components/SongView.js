import React from 'react';


export default class SongView extends React.Component {

    render() {

        return (
            <h4>
                <span>{this.props.artist.name}</span>&nbsp;
                <span>{this.props.album.name}</span>&nbsp;
                <span>{this.props.song.name}</span>
            </h4>
        );
    }
}