import React from 'react';


function SelectedAlbum(props) {
    return <b>{props.name}</b>
}

function NormalAlbum(props) {
    return <span>{props.name}</span>
}

class Album extends React.Component {

    render() {
        let album = null;
        if(this.props.isSelected)
            album = <SelectedAlbum name={this.props.album.album}/>;
        else
            album = <NormalAlbum name={this.props.album.album}/>;

        return (
        <div id={this.props.id} onClick={(event) => this.onClick(event)}>
            {album}
        </div>
        );
    }

    onClick(event) {
        const target = event.currentTarget;
        const albumId = target.id;
        const albumIndex = albumId.substring(3);
        console.log("Album selected:", albumIndex);
        this.props.setAlbum(albumIndex);
    }
}
export default class ArtistView extends React.Component {

    renderAlbums() {
        const artist = this.props.artist;
        if(artist.albums && artist.albums.length) {
            return artist.albums.map((a, i) => {
                const selected = this.props.currentAlbum.name === a.album;
                return <Album id={`al-${i}`}
                              key={a.album}
                              album={a}
                              isSelected={selected}
                              setAlbum={this.props.setAlbum}/>
            });
        }
    }

    render() {
        console.log("ArtistView:", this.props);
        return (
            <div>
                <h2>{this.props.artist.artist}</h2>
                { this.renderAlbums() }
            </div>
        );
    }

}