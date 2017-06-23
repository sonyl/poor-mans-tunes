/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addSongsToPlaylist } from '../actions/playlistActions';
import { getSelectedAlbum, getSelectedAlbumInfo } from '../reducers';
import GlyphIcon from '../components/GlyphIcon';
import SplitButton from '../components/SplitButton';
import { sanitizeHtml, getLastFmThumbnail, getCoverUrl, createLog, LASTFM_IMG_SIZE_XLARGE } from '../components/utils';
import {sendSongToSonos} from '../actions/serverActions';
const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'AlbumView');

import type { Album, LastFmInfo, PlaylistSong } from '../types';

function PlusIcon() {
    return <GlyphIcon iconName='share-alt'/>;
}

function Song({index, title, addAlbumSongToPlaylist, sendAlbumSongToSonos}){
    return (
        <div>
            <SplitButton
                size="extra-small"
                defaultLabel=""
                defaultIcon={<PlusIcon/>}
                defaultOnClick={() => addAlbumSongToPlaylist(index, false)}
                actions={ [
                    { label: 'add song to top of playlist', onClick: () => addAlbumSongToPlaylist(index, true)},
                    { label: 'add song to end of playlist', onClick: () => addAlbumSongToPlaylist(index, false)},
                    { label: 'play song on Sonos', onClick: () => sendAlbumSongToSonos(index)}
                ] }
            />
            &nbsp;&nbsp; {title}
        </div>
    );
}

type AlbumViewProps = {
    album: Album,
    lastFmInfo: LastFmInfo,
    addSongsToPlaylist: (artist: string, album: string, songs: PlaylistSong[] | PlaylistSong, top: boolean)=> void
}

const AlbumView = ({album, lastFmInfo, addSongsToPlaylist}: AlbumViewProps) => {
    log('render', 'album=%o, lastFmInfo=%o', album, lastFmInfo);

    function addAlbumSongToPlaylist(index, top=false) {
        let songs;
        if(index === null) {
            songs = album.songs.map(s => ({song: s.title, url: s.src }));
        } else {
            const song = album.songs[index];
            songs = [{ song: song.title, url: song.src}];
        }
        addSongsToPlaylist(album.artist, album.album, songs, top);
    }

    function sendAlbumSongToSonos(index: number) {
        const song = album.songs[index];
        log('sendAlbumSongToSonos', 'song=%o', song);
        sendSongToSonos({title: song.title, src: song.src});
    }

    function renderSongs () {
        if(album.songs) {

            const splitButtonProps = {
                actions: [
                    {label: 'add all songs to top of playlist', onClick: () => addAlbumSongToPlaylist(null, true)},
                    {label: 'add all songs to end of playlist', onClick: () => addAlbumSongToPlaylist(null, false)}
                ],
                defaultLabel: 'Add album to playlist',
                defaultIcon: <PlusIcon/>,
                defaultOnClick: () => addAlbumSongToPlaylist(null, false)
            };

            return (
                <div>
                    <h4>Songs:
                        <span className="pull-right">
                            <SplitButton {...splitButtonProps} size="extra-small"/>
                        </span>
                    </h4>

                    {
                        album.songs.map((s, i) => (
                            <Song index={i}
                                  key={i}
                                  track={s.track}
                                  title={s.title}
                                  addAlbumSongToPlaylist={addAlbumSongToPlaylist}
                                  sendAlbumSongToSonos={sendAlbumSongToSonos}
                            />
                        ))
                    }
                </div>
            );
        }
    }

    const renderThumbnail = () => {
        const url = getLastFmThumbnail(lastFmInfo, LASTFM_IMG_SIZE_XLARGE) || getCoverUrl(album);

        if(url) {
            return (
                <div>
                    <img src={url} className="img-responsiv img-rounded" style={{maxWidth: '300px', maxHeight: 'auto'}}/>
                </div>
            );
        }
    };

    const renderWiki = () => {
        const summary = lastFmInfo && lastFmInfo.wiki && lastFmInfo.wiki.summary;
        if(summary) {
            return  <div dangerouslySetInnerHTML={sanitizeHtml(summary)}/>;
        }
    };

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3><small>Album:</small> { album.album }</h3>
                {renderThumbnail()}
            </div>
            <div className="panel-body">
                { renderWiki() }
                { renderSongs() }
            </div>
        </div>
    );
};


AlbumView.propTypes = {
    album: PropTypes.shape({
        artist: PropTypes.string,
        album: PropTypes.string,
        songs: PropTypes.arrayOf(PropTypes.object)
    }),
    lastFmInfo: PropTypes.shape({
        name: PropTypes.string,
        artist: PropTypes.string,
        wiki: PropTypes.object
    }),
    addSongsToPlaylist: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    album: getSelectedAlbum(state),
    lastFmInfo: getSelectedAlbumInfo(state)
});

export default connect(mapStateToProps, { addSongsToPlaylist })(AlbumView);

