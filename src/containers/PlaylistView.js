import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { clearPlaylist, removeFromPlaylist } from '../actions/playlistActions';
import GlyphIcon from '../components/GlyphIcon';

const getEntry = (artists, {artistIndex, albumIndex, songIndex}) => {

    const artist = artists[artistIndex];
    if(artist) {
        const album = artist.albums[albumIndex];
        if(album) {
            const song = album.songs[songIndex];
            if(song) {
                return {
                    artist: artist.artist,
                    album: album.album,
                    title: song.title
                };
            }
        }
    }
    return {};
};

const Entry = ({artist, album, title, index, removeEntry}) => {

    return (
        <div onClick={() => removeEntry(index)}>
            <GlyphIcon iconName="trash" />
            &nbsp;
            &nbsp;
            {`${index + 1}. ${artist} - ${album} - ${title}`}
        </div>
    );
};

const PlaylistView = ({artists, playlist, removeFromPlaylist, clearPlaylist}) => {

    console.log('PlaylistView.render', playlist);

    function renderPlaylist() {
        return playlist.map((e, i) => {
            return <Entry key={i} index={i} removeEntry={removeFromPlaylist} {...getEntry(artists, e)}></Entry>;
        });
    }

    function renderDeleteButton() {
        if(playlist[0]) {
            return (
                <button type="button" className="btn btn-default pull-right"
                   onClick={clearPlaylist}
                >
                    Clear Playlist
                </button>
            );
        }
    }

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3 className="panel-title pull-left">Playlist</h3>
                {renderDeleteButton()}
                <div className="clearfix"/>
            </div>
            <div className="panel-body">
                { renderPlaylist() }
            </div>
        </div>
    );
};

PlaylistView.propTypes = {
    artists: PropTypes.array,
    playlist: PropTypes.arrayOf(PropTypes.shape({
        artistIndex: PropTypes.number.isRequired,
        albumIndex: PropTypes.number.isRequired,
        songIndex: PropTypes.number.isRequired
    })).isRequired,
    removeFromPlaylist: PropTypes.func.isRequired,
    clearPlaylist: PropTypes.func.isRequired
};

function mapStateToProps({ albums, playlist }) {
    return  {
        artists: albums.artists,
        playlist
    };
}

function mapDispatchToProps() {
    return { clearPlaylist, removeFromPlaylist };
}

export default connect(mapStateToProps, mapDispatchToProps())(PlaylistView);