import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import { addToPlaylist } from '../actions/playlistActions';
import { getAlbum, getAlbumInfo } from '../reducers';
import GlyphIcon from '../components/GlyphIcon';
import SplitButton from '../components/SplitButton';
import { sanitizeHtml, getLastFmThumbnail, getCoverUrl, LASTFM_IMG_SIZE_XLARGE } from '../components/utils';


function PlusIcon() {
    return <GlyphIcon iconName='share-alt'/>;
}

function Song({index, title, addAlbumSongToPlaylist}){
    return (
        <div>
            <SplitButton
                size="extra-small"
                defaultLabel=""
                defaultIcon={<PlusIcon/>}
                defaultOnClick={() => addAlbumSongToPlaylist(index, false)}
                actions={ [
                    { label: 'add song to top of playlist', onClick: () => addAlbumSongToPlaylist(index, true)},
                    { label: 'add songs to end of playlist', onClick: () => addAlbumSongToPlaylist(index, false)}
                ] }
            />
            &nbsp;&nbsp; {title}
        </div>
    );
}

const AlbumView = ({album, lastFmInfo, addToPlaylist}) => {
    console.log('AlbumView.render() album=%o, lastFmInfo=%o', album, lastFmInfo);

    function addAlbumSongToPlaylist(index, top=false) {
        let songs;
        if(index === null) {
            songs = album.songs.map(s => ({song: s.title, url: s.mp3 }));
        } else {
            const song = album.songs[index];
            songs = [{ song: song.title, url: song.mp3}];
        }
        addToPlaylist(album.artist, album.album, songs, top);
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
                                  addAlbumSongToPlaylist={addAlbumSongToPlaylist}/>
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
                    <img src={url} className="img-responsiv img-rounded" style={{maxWidth: '300', maxHeight: 'auto'}}/>
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
                <h3>Album: { album.album }</h3>
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
    addToPlaylist: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    const {selection} = state;
    const selectedArtist = selection.artist || {};
    const selectedAlbum = selection.album || {};
    const album = getAlbum(state, selectedArtist.index, selectedAlbum.index) || {};

    return {
        album,
        lastFmInfo: getAlbumInfo(state, album.artist, album.album)
    };
}

export default connect(mapStateToProps, { addToPlaylist })(AlbumView);

