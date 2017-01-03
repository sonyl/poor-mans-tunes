import React, {Component, PropTypes} from 'react';

import Card from 'grommet/components/Card';
import Markdown from 'grommet/components/Markdown';

import NavLink from './NavLink';

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

const ArtistView = ({artist, selectedArtist}) => {
    function renderAlbums() {
        if(artist.albums && artist.albums.length) {
            return artist.albums.map((a, i) => {
                return (
                    <NavLink key={i} to={`/${artist.artist}/${a.album}`}>
                        {a.album}
                    </NavLink>
                );
            });
        }
    }

    console.log('ArtistView.render() artist: %o, selectedArtist: %o', artist, selectedArtist);
    return (
        <Card
            contentPad='small'
            label='Artist Info:'
            heading={ artist.artist }
            thumbnail={getThumbnail(selectedArtist.lastFmInfo)}
        >
            <Markdown content={selectedArtist.lastFmInfo && selectedArtist.lastFmInfo.bio && selectedArtist.lastFmInfo.bio.summary}/>
            { renderAlbums() }
        </Card>
    );
};

ArtistView.propTypes = {
    artist: PropTypes.object.isRequired,
    selectedArtist: PropTypes.object.isRequired
};

export default ArtistView;