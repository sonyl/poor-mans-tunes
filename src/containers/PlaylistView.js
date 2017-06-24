/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions/playlistActions';
import GlyphIcon from '../components/GlyphIcon';
import { createLog } from '../components/utils';

import type {PlaylistEntry} from '../types';

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

type PlaylistViewProps = {
    playlist: PlaylistEntry[],
    removeSongAtIndexFromPlaylist: (index: number)=>void,
    moveSongToPositionInPlaylist: (index: number, newIndex: number)=>void,
    addRandomSongToPlaylist: ()=>void,
    clearPlaylist: ()=>void
}

// export for testing purpose only
export const PlaylistView = (props: PlaylistViewProps) => {
    const {
        playlist, removeSongAtIndexFromPlaylist, clearPlaylist, moveSongToPositionInPlaylist,
        addRandomSongToPlaylist
    } = props;

    log('render', 'playlist=%o, props=%o', playlist, props);

    function renderPlaylist() {
        return playlist.map((entry, i) => {
            return <Entry key={i} index={i} {...entry} removeEntry={removeSongAtIndexFromPlaylist}
                moveSongToPositionInPlaylist={moveSongToPositionInPlaylist}></Entry>;
        });
    }

    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3 className="panel-title pull-left">Playlist</h3>
                <button type="button" className="btn btn-default pull-right"
                    onClick={clearPlaylist} disabled={!playlist[0]}>
                    Clear Playlist
                </button>
                <button type="button" className="btn btn-default pull-right" onClick={addRandomSongToPlaylist}>
                    Add random song
                </button>
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
        url: PropTypes.oneOfType(
            [
                PropTypes.string,
                PropTypes.arrayOf(PropTypes.string)
            ]
        ).isRequired
    })).isRequired,
    removeSongAtIndexFromPlaylist: PropTypes.func.isRequired,
    moveSongToPositionInPlaylist: PropTypes.func.isRequired,
    addRandomSongToPlaylist: PropTypes.func.isRequired,
    clearPlaylist: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    playlist: state.playlist
});

const mapDispatchToProps = {
    clearPlaylist: actions.clearPlaylist,
    removeSongAtIndexFromPlaylist: actions.removeSongAtIndexFromPlaylist,
    moveSongToPositionInPlaylist: actions.moveSongToPositionInPlaylist,
    addRandomSongToPlaylist: actions.addRandomSongToPlaylist
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistView);