import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';

import NavLink from '../components/NavLink';
import { sanitizeHtml, createLinkUrl } from '../components/utils';

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
        const url = getThumbnail(selectedArtist.lastFmInfo);
        if(url) {
            return (
                <div className="thumbnail">
                    <img src={url}/>
                </div>
            );
        }
    }

    function renderWiki() {
        if(selectedArtist.lastFmInfo && selectedArtist.lastFmInfo.bio && selectedArtist.lastFmInfo.bio.summary) {
            return (
                <div dangerouslySetInnerHTML={sanitizeHtml(selectedArtist.lastFmInfo.bio.summary)}/>
            );
        }
    }


    console.log('ArtistView.render() artist: %o, selectedArtist: %o', artist, selectedArtist);
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
    selectedArtist: PropTypes.object.isRequired
};

function mapStateToProps({albums, selection}) {
    return {
        artist: albums.artists && albums.artists[selection.artist.index] || {},
        selectedArtist: selection.artist
    };
}

export default connect(mapStateToProps)(ArtistView);