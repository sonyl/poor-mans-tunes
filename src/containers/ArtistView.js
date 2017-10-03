/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getSelectedArtistInfo, getSelectedArtist } from '../reducers';
import { sanitizeHtml, createLinkUrl, getLastFmThumbnail, createLog, LASTFM_IMG_SIZE_XLARGE  } from '../utils';
import NavLink from '../components/NavLink';

//import type { MapStateToProps } from 'react-redux';
import type { Artist, LastFmInfo} from '../types';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'ArtistView');

type Props = {
    artist: Artist,
    lastFmInfo: LastFmInfo
};

const ArtistView = ({artist, lastFmInfo}: Props) => {
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
                <h3><small>Artist:</small> { artist.artist }</h3>
                {renderThumbnail()}
            </div>
            <div className="panel-body">
                { renderWiki() }
                { renderAlbums() }
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        artist: getSelectedArtist(state),
        lastFmInfo: getSelectedArtistInfo(state)
    };
};

const dummyDispatchToMakeFlowHappy = (dispatch: Dispatch) => ({
    dispatch: dispatch
});

export default withRouter(connect(mapStateToProps, dummyDispatchToMakeFlowHappy)(ArtistView));