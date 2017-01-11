import React, {PropTypes} from 'react';
import GlyphIcon from './GlyphIcon';

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
        <div>
            {`${index + 1}. ${artist} - ${album} - ${title}`}
            &nbsp;
            <GlyphIcon iconName="trash" onClick={() => removeEntry(index)}/>
        </div>
    );
};

const PlaylistView = ({artists, playlist, removeEntry}) => {

    console.log('PlaylistView.render', playlist);

    function renderPlaylist() {
        return playlist.map((e, i) => {
            return <Entry key={i} index={i} removeEntry={removeEntry} {...getEntry(artists, e)}></Entry>;
        });
    }

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3>Playlist</h3>
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
    removeEntry: PropTypes.func.isRequired
};

export default PlaylistView;