import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';

import { getArtistInfo } from '../reducers';
import { sanitizeHtml, createLinkUrl } from '../components/utils';
import NavLink from '../components/NavLink';

function getThumbnail(lastFmInfo) {
    const image = lastFmInfo && lastFmInfo.image;
    if(image) {
        if (image.length > 3 && image[3]['#text'].length > 0) {
            return image[3]['#text'];
        }
        if (image.length > 2 && image[2]['#text'].length > 0) {
            return image[2]['#text'];
        }
        if (image.length > 1 && image[1]['#text'].length > 0) {
            return image[1]['#text'];
        }
        if (image.length > 0 && image[0]['#text'].length > 0) {
            return image[0]['#text'];
        }
    }
}

const ArtistView = ({artist, selectedArtist, lastFmInfo}) => {
    function renderAlbums() {
        if(artist.albums && artist.albums.length) {
            return (
                <div>
                    <h4>Available Albums:</h4>
                    {
                        artist.albums.map((a, i) => (
                            <div key={i}>
                                <NavLink to={createLinkUrl(artist.artist, a.album)}>
                                    {a.album}
                                </NavLink>
                            </div>
                        ))
                    }
                </div>
            );
        }
    }

    function renderThumbnail() {
        const url = getThumbnail(lastFmInfo);
        if(url) {
            return (
                <div>
                    <img src={url} className="img-responsiv img-rounded"/>
                </div>
            );
        }
    }

    function renderWiki() {
        const summary = lastFmInfo && lastFmInfo.bio && lastFmInfo.bio.summary;
        if(summary) {
            return (
                <div dangerouslySetInnerHTML={sanitizeHtml(summary)}/>
            );
        }
    }


    console.log('ArtistView.render() artist: %o, selectedArtist: %o, lastFmInfo: %o',
        artist, selectedArtist, lastFmInfo);
    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3>Artist: { artist.artist }</h3>
                {renderThumbnail()}
            </div>
            <div className="panel-body">
                { renderWiki() }
                { renderAlbums() }
            </div>
        </div>
    );
};

ArtistView.propTypes = {
    artist: PropTypes.object.isRequired,
    selectedArtist: PropTypes.object.isRequired,
    lastFmInfo: PropTypes.object
};

function mapStateToProps(state) {
    const {albums, selection} = state;
    const artist = albums.artists && albums.artists[selection.artist.index] || {};
    return {
        artist,
        selectedArtist: selection.artist,
        lastFmInfo: getArtistInfo(state, artist.artist)
    };
}

export default connect(mapStateToProps)(ArtistView);