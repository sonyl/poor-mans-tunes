import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { clearPlaylist, removeSongAtIndexFromPlaylist, moveSongToPositionInPlaylist } from '../actions/playlistActions';
import GlyphIcon from '../components/GlyphIcon';
import { createLog } from '../components/utils';

const ENABLE_LOG = false;
const entryLog = createLog(ENABLE_LOG, 'Entry');
const log = createLog(ENABLE_LOG, 'PlaylistView');


const Entry = ({artist, album, song, index, removeEntry, moveSongToPositionInPlaylist}) => {
    const style = {
        textOverflow: 'ellipsis',               // the folling 2 lines cut text and add ... if text is to long
        overflow: 'hidden',
        whiteSpace: 'nowrap',

        border: '1px solid #ddd ',
        borderRadius: '5px',
        paddingTop: '2px',
        paddingBottom: '2px',

        cursor: 'pointer'
    };

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData('pos', index);
    }

    function drop(ev) {
        ev.preventDefault();
        const data = parseInt(ev.dataTransfer.getData('pos'), 10);
        entryLog('drop', '%d, data=%s', index, data);
        moveSongToPositionInPlaylist(data, index);
    }

    return (
        <div onDrop={drop}  onDragOver={allowDrop} >
            <div style={style} draggable={true} onDragStart={drag} >
                <GlyphIcon iconName="trash" onClick={() => removeEntry(index)}/>
                &nbsp;
                &nbsp;
                {`${index + 1}. ${artist} - ${song}`}<span className="small">&nbsp;{`[Album - ${album}]`}</span>
            </div>
        </div>
    );
};

// export for testing purpose only
export const PlaylistView = ({playlist, removeSongAtIndexFromPlaylist, clearPlaylist, moveSongToPositionInPlaylist}) => {

    log('render', 'playlist=%o', playlist);

    function renderPlaylist() {
        return playlist.map((entry, i) => {
            return <Entry key={i} index={i} {...entry} removeEntry={removeSongAtIndexFromPlaylist}
                          moveSongToPositionInPlaylist={moveSongToPositionInPlaylist} ></Entry>;
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
    removeSongAtIndexFromPlaylist: PropTypes.func.isRequired,
    moveSongToPositionInPlaylist: PropTypes.func.isRequired,
    clearPlaylist: PropTypes.func.isRequired
};

function mapStateToProps({ playlist }) {
    return  {
        playlist
    };
}

function mapDispatchToProps() {
    return { clearPlaylist, removeSongAtIndexFromPlaylist, moveSongToPositionInPlaylist };
}

export default connect(mapStateToProps, mapDispatchToProps())(PlaylistView);