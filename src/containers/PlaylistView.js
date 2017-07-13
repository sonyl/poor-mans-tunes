/* @flow */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import FileSaver from 'file-saver';
import M3U from 'm3u';
import { Parser as M3uParser } from 'm3u8-parser';
import { createAudioUrl, createLog, createLinkUrl } from '../utils';
import * as actions from '../actions/playlistActions';
import GlyphIcon from '../components/GlyphIcon';
import SplitButton from '../components/SplitButton';
import NavLink from '../components/NavLink';

import type {PlaylistEntry} from '../types';

const ENABLE_LOG = false;
const entryLog = createLog(ENABLE_LOG, 'Entry');
const log = createLog(ENABLE_LOG, 'PlaylistView');

type EntryProps = {
    artist: string,
    album: string,
    song: string,
    index: number,
    removeEntry: (number)=> void,
    moveSongToPositionInPlaylist: (number, number)=> void
}
const Entry = ({artist, album, song, index, removeEntry, moveSongToPositionInPlaylist}: EntryProps) => {
    const style = {
        border: '1px solid #ddd ',
        borderRadius: '5px',
        paddingTop: '2px',
        paddingBottom: '2px',
        paddingLeft: '3px',
        paddingRight: '3px',
        cursor: 'pointer'
    };

    const textStyle = {
        textOverflow: 'ellipsis',               // the folling 2 lines cut text and append '...' if text is to long
        overflow: 'hidden',
        whiteSpace: 'nowrap'
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
                <NavLink to={createLinkUrl(artist, album)}>
                    <div style={textStyle}>
                        {`${index + 1}. ${artist} - ${song}`}
                        <span className="small">&nbsp;{`[Album - ${album}]`}</span>
                    </div>
                </NavLink>
                <GlyphIcon iconName="trash" onClick={() => removeEntry(index)} style={{float: 'right', top: '-16px'}}/>
            </div>
        </div>
    );
};

const fileRead = (blob: Blob | File): Promise<string> => {

    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onload = (e: Object) => resolve(e.target.result);
        reader.onabort = (e: Event) => reject(new Error('aborted'));
        reader.onerror = (e: Event) => reject(new Error('error'));
        reader.readAsText(blob);
    });
};

type PlaylistViewProps = {
    playlist: PlaylistEntry[],
    removeSongAtIndexFromPlaylist: (index: number)=> void,
    moveSongToPositionInPlaylist: (index: number, newIndex: number)=> void,
    addRandomSongToPlaylist: ()=> void,
    clearPlaylist: ()=> void,
    replacePlaylist: (urls: Array<string>)=> void
};
type DefaultPlaylistViewProps = void;
type DefaultPlaylistViewState = void;

// export for testing purpose only
export class PlaylistView extends Component<DefaultPlaylistViewProps, PlaylistViewProps, DefaultPlaylistViewState> {

    playlistInput: HTMLInputElement;

    constructor(props: PlaylistViewProps) {
        super(props);

        // Check for the various File API support.
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            console.warn('The File APIs are not fully supported in this browser.');
        }
    }

    convertToM3U(): ?string {
        const { playlist } = this.props;
        const writer = M3U.extendedWriter();

        if(playlist[0]) {
            playlist.forEach(p => {
                const url = createAudioUrl(p.url, 'mp3');
                if(url) {
                    writer.file(encodeURI(url), 0, p.artist + ' - ' + p.song);
                }
            });
            return writer.toString();
        }
    }

    savePlaylist() {
        const text = this.convertToM3U();

        if(text) {
            const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, 'playlist.m3u', true);
        }
    }

    loadPlaylist() {
        log('loadPlaylist', 'selected', );
        this.playlistInput.click();
    }

    handlePlaylistUpload(e: Event) {
        const files = this.playlistInput.files;
        log('handlePlaylistUpload', 'files:', files);
        if(files && files[0]) {
            const file = files[0];
            log('handlePlaylistUpload', 'selected: name: %s, size: %d, mime-type: %s', file.name, file.size, file.type);
            if(file.size > 100*1024) {
                alert('file is too big');
                return;
            }
            fileRead(file).then(text => {
                log('handlePlaylistUpload', 'text: %s', text);
                const parser = new M3uParser();
                parser.push(text);
                log('handlePlaylistUpload', 'parsed: %o', parser.manifest);
                if(Array.isArray(parser.manifest.segments)) {
                    const urls = parser.manifest.segments.map(s => decodeURI(s.uri));
                    this.props.replacePlaylist(urls);
                }

            }).catch(error => {
                log('handlePlaylistUpload', 'error: %o', error);
            });
        }
        this.playlistInput.value = '';    // re-arm for next onChange()
    }

    renderPlaylist() {
        const { playlist, removeSongAtIndexFromPlaylist, moveSongToPositionInPlaylist } = this.props;

        return playlist.map((entry, i) => {
            return <Entry key={i} index={i} {...entry} removeEntry={removeSongAtIndexFromPlaylist}
                moveSongToPositionInPlaylist={moveSongToPositionInPlaylist}
            />;
        });
    }

    render() {
        const { playlist, clearPlaylist, addRandomSongToPlaylist } = this.props;

        log('render', 'playlist=%o, props=%o', playlist, this.props);

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title pull-left">Playlist</h3>
                    <button type="button" className="btn btn-default pull-right"
                        onClick={clearPlaylist} disabled={!playlist[0]}>
                        Clear Playlist
                    </button>
                    <SplitButton className="pull-right" defaultOnClick={addRandomSongToPlaylist}
                        actions={[
                            {label: 'Add Random Song to Playlist', onClick: addRandomSongToPlaylist},
                            {label: 'Save Playlist', onClick: e => this.savePlaylist(), disabled: !playlist[0]},
                            {label: 'Load Playlist', onClick: e => this.loadPlaylist()}
                        ]}
                    />
                    <div className="clearfix"/>
                </div>
                <div className="panel-body" style={{maxHeight: '400px', overflowY: 'scroll'}}>
                    { this.renderPlaylist() }
                </div>
                <input id="loadPlaylist" type="file" accept=".m3u" style={{display: 'none'}}
                    ref={r => this.playlistInput = r}
                    onChange={e => {
                        console.log('======================= On Change =====================');
                        this.handlePlaylistUpload(e);
                    }}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    playlist: state.playlist
});

const mapDispatchToProps = {
    clearPlaylist: actions.clearPlaylist,
    removeSongAtIndexFromPlaylist: actions.removeSongAtIndexFromPlaylist,
    moveSongToPositionInPlaylist: actions.moveSongToPositionInPlaylist,
    addRandomSongToPlaylist: actions.addRandomSongToPlaylist,
    replacePlaylist: actions.replacePlaylist
};
// as long as we do not have deep redux integration (react-router-redux is somewhat incomplete in 5.0.0-alpha.6)
// we utilize the workaround described in https://reacttraining.com/react-router/web/guides/redux-integration
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlaylistView));