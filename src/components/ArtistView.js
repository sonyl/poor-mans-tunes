import React, {Component, PropTypes} from 'react';

import Card from 'grommet/components/Card';

function getThumbnail(artist) {
    if(artist && artist.image) {
        if (artist.image.length > 3 && artist.image[3]['#text'].length > 0) {
            return artist.image[3]['#text'];
        }
        if (artist.image.length > 2 && artist.image[2]['#text'].length > 0) {
            return artist.image[2]['#text'];
        }
        if (artist.image.length > 1 && artist.image[1]['#text'].length > 0) {
            return artist.image[1]['#text'];
        }
        if (artist.image.length > 0 && artist.image[0]['#text'].length > 0) {
            return artist.image[0]['#text'];
        }
    }
}

function Album({id, album, isSelected, setAlbum}) {

    const classNames = isSelected ? 'selected' : '';

    return (
        <div id={id} onClick={onClick} className={classNames}>
            {album.album}
        </div>
    );


    function onClick(event) {
        const target = event.currentTarget;
        const albumId = target.id;
        const albumIndex = albumId.substring(3);
        console.log('Album selected:', albumIndex);
        if(setAlbum) {
            setAlbum(albumIndex);
        }
    }
}

export default class ArtistView extends Component {

    componentWillReceiveProps(nextProps){
        console.log('ArtistView.componentWillReceiveProps:', nextProps);

    }
    renderAlbums() {
        const { artist, currentAlbum, setAlbum } = this.props;

        if(artist.albums && artist.albums.length) {
            return artist.albums.map((a, i) => {
                const selected = currentAlbum.name === a.album;
                return <Album id={`al-${i}`}
                              key={a.album}
                              album={a}
                              isSelected={selected}
                              setAlbum={setAlbum}/>;
            });
        }
    }

    render() {
        const {artist, currentArtist} = this.props;
        console.log('ArtistView.render:', this.props);
        return (
            <Card
                label='Artist Info:'
                heading={ artist.artist }
                thumbnail={getThumbnail(currentArtist.lastFm)}
            >
                { this.renderAlbums() }
            </Card>
        );
    }
}

ArtistView.propTypes = {
    artist: PropTypes.object,
    currentArtist: PropTypes.object,
    currentAlbum: PropTypes.object,
    setAlbum: React.PropTypes.func
};