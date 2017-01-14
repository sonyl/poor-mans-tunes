import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { clearPlaylist, removeFromPlaylist } from '../actions/playlistActions';
import NavLink from '../components/NavLink';
import GlyphIcon from '../components/GlyphIcon';
import { createLinkUrl } from '../components/utils';

const Entry = ({artist, album, song, index, removeEntry}) => {
    const style = {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    };

    return (
        <div  style={style}>
            <GlyphIcon iconName="trash" onClick={() => removeEntry(index)}/>
            &nbsp;
            &nbsp;
            <NavLink to={createLinkUrl(artist, album)}>
                {`${index + 1}. ${artist} - ${song}`}<span className="small">&nbsp;{`[Album - ${album}]`}</span>
            </NavLink>
        </div>
    );
};

const PlaylistView = ({playlist, removeFromPlaylist, clearPlaylist}) => {

    console.log('PlaylistView.render', playlist);

    function renderPlaylist() {
        return playlist.map((entry, i) => {
            return <Entry key={i} index={i} {...entry} removeEntry={removeFromPlaylist} ></Entry>;
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
    playlist: PropTypes.arrayOf(PropTypes.shape({
        artist: PropTypes.string.isRequired,
        album: PropTypes.string.isRequired,
        song: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
    })).isRequired,
    removeFromPlaylist: PropTypes.func.isRequired,
    clearPlaylist: PropTypes.func.isRequired
};

function mapStateToProps({ playlist }) {
    return  {
        playlist
    };
}

function mapDispatchToProps() {
    return { clearPlaylist, removeFromPlaylist };
}

export default connect(mapStateToProps, mapDispatchToProps())(PlaylistView);