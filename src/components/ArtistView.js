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

export default class ArtistView extends Component {

    static propTypes = {
        artist: PropTypes.object.isRequired,
        currentArtist: PropTypes.object.isRequired,
    };

    componentWillReceiveProps(nextProps){
        console.log('ArtistView.componentWillReceiveProps:', nextProps);

    }
    renderAlbums() {
        const { artist } = this.props;

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

    render() {
        const {artist, currentArtist} = this.props;
        console.log('ArtistView.render:', this.props);
        return (
            <Card
                contentPad='small'
                label='Artist Info:'
                heading={ artist.artist }
                thumbnail={getThumbnail(currentArtist.lastFmInfo)}
            >
                <Markdown content={currentArtist.lastFmInfo && currentArtist.lastFmInfo.bio && currentArtist.lastFmInfo.bio.summary}/>
                { this.renderAlbums() }
            </Card>
        );
    }
}