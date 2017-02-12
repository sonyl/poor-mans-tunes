import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { getSelectedArtistInfo, getSelectedArtist } from '../reducers';
import { sanitizeHtml, createLinkUrl, getLastFmThumbnail, createLog, LASTFM_IMG_SIZE_XLARGE  } from '../components/utils';
import NavLink from '../components/NavLink';

const ENABLE_LOG = true;
const log = createLog(ENABLE_LOG, 'ArtistView');

const ArtistView = ({artist, lastFmInfo}) => {
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
        const url = getLastFmThumbnail(lastFmInfo, LASTFM_IMG_SIZE_XLARGE);
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


    log('render', 'artist: %o, lastFmInfo: %o', artist, lastFmInfo);
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
    lastFmInfo: PropTypes.object
};

const mapStateToProps = state => ({
    artist: getSelectedArtist(state),
    lastFmInfo: getSelectedArtistInfo(state)
});

export default connect(mapStateToProps)(ArtistView);