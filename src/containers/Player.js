/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import { removeSongAtIndexFromPlaylist } from '../actions/playlistActions';
import { sendNotification } from '../actions/notificationsActions';
import { requestAlbumIfNotExists } from '../actions/lastFmActions';
import { setVolume } from '../actions/settingsActions';
import { requestSongLyricsIfNotExists } from '../actions/lyricsActions';
import { getAlbumInfo, getAlbumByName, getValueFromSettings, getLyrics } from '../reducers';

import AudioPlayer from '../components/AudioPlayer';
import Slider from '../components/Slider';
import ProgressBar from '../components/ProgressBar';
import GlyphIcon from '../components/GlyphIcon';
import NavLink from '../components/NavLink';
import LevelMeter from '../components/LevelMeter';
import Modal from '../components/Modal';
import { createLinkUrl, sendDesktopNotification, getLastFmThumbnail, getCoverUrl, createAudioUrls, createLog,
    LASTFM_IMG_SIZ_MEDIUM } from '../utils';

import type {Dispatch, Url, LastFmInfo, Album} from '../types';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'Player');


function PlayIcon(props) {
    return <GlyphIcon iconName={props.playing ? 'pause' : 'play'}/>;
}

function RestartIcon() {
    return <GlyphIcon iconName='step-backward'/>;
}

function PlayNextIcon() {
    return <GlyphIcon iconName='fast-forward'/>;
}

function CdIcon() {
    return <GlyphIcon iconName='cd' style={{fontSize: '96px', float: 'left', marginRight: '10px'}}/>;
}

function Button({children, onClick}) {
    return <button className="btn btn-lg" onClick={onClick}>{children}</button>;
}

function format (seconds: number) {

    function pad (string) {
        return ('0' + string).slice(-2);
    }

    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    if (hh) {
        return `${hh}:${pad(mm)}:${ss}`;
    }
    return `${mm}:${ss}`;
}

type DurationProps = {
    seconds: number
};

function Duration ({ seconds }: DurationProps) {
    return (
        <time dateTime={`P${Math.round(seconds)}S`}>
            {format(seconds)}
        </time>
    );
}

type AlbumLinkProps = {
    artist: ?string,
    album: ?string,
    children?: React.Node
};

function AlbumLink({artist, album, children}: AlbumLinkProps) {
    if(artist && album) {
        return (
            <NavLink activate={false} to={createLinkUrl(artist, album)} style={{}}>
                {children}
            </NavLink>
        );
    }
    return null;
}

type PlayerProps = {
    modal: Modal,
    url: ?Url,
    artist: ?string,
    album: ?string,
    song: ?string,
    title: ?string,
    volume: number,
    albumInfo: LastFmInfo,
    colAlbum: Album,
    lyricsAvail: boolean,

    setVolume: (number)=>void,
    nextSong: ()=>void,
    requestAlbum: (string, string)=> void,
    sendNotification: (string, ?string)=> void,
    requestSongLyricsIfNotExists: (artist: ?string, song: ?string)=> Promise<any>
};
type PlayerState = {
    playing: boolean,
    played: number,
    duration: number,
    style?: Object,
    seeking?: boolean
};


class Player extends React.Component<PlayerProps, PlayerState> {

    state: PlayerState;
    player: ?AudioPlayer;

    constructor(props: PlayerProps) {
        super(props);
        this.state = {
            playing: !!this.props.url,
            played: 0,
            duration: 0
        };
        log('constructor', 'props: %o', props);

        const { playing } = this.state;
        const { artist, album, title, requestAlbum, sendNotification } = props;

        if(playing && title) {
            if(artist && album) {
                requestAlbum(artist, album);
            }
            sendDesktopNotification('Now playing:', title);
            sendNotification('Now playing:', title);
        }
    }

    // read style from css variables lazily,
    // in prod mode the css variables are not yet set when componentDidMount is called (webpack specific)
    updateStyle() {
        log('updateStyle', 'style already set: %s', !!this.state.style);
        if(!this.state.style) {
            const bodyStyle = window.getComputedStyle(document.body);
            const backgroundColor = bodyStyle.getPropertyValue('--main-heading-bg') || undefined;
            const defaultColor = bodyStyle.getPropertyValue('--main-default-color') || undefined;
            const successColor = bodyStyle.getPropertyValue('--main-success-color') || undefined;
            const warningColor = bodyStyle.getPropertyValue('--main-warning-color') || undefined;
            const dangerColor = bodyStyle.getPropertyValue('--main-danger-color') || undefined;

            if(backgroundColor || defaultColor || successColor || warningColor || dangerColor) {
                this.setState({
                    style: {backgroundColor, defaultColor, successColor, warningColor, dangerColor}
                });
            }
        }
    }

    componentWillReceiveProps(nextProps){
        log('componentWillReceiveProps', 'nextProps:%o, props:%o', nextProps, this.props);
        this.updateStyle();
        if(this.props.title !== nextProps.title) {
            const newState = {};
            newState.playing = !!nextProps.url;
            if(!!nextProps.url && nextProps.title) {
                sendDesktopNotification('Now playing:', nextProps.title);
                this.props.sendNotification('Now playing:', nextProps.title);
            } else {
                newState.played = 0;
                newState.duration = 0;
            }
            this.setState(newState);
        }
        if(nextProps.artist && nextProps.album &&
            (nextProps.artist !== this.props.artist || nextProps.album !== this.props.album)) {
            this.props.requestAlbum(nextProps.artist, nextProps.album);
        }
    }

    showLyrics = () => {
        const {artist, song, modal} = this.props;
        this.props.requestSongLyricsIfNotExists(artist, song).then(() => {
            modal.show();
        });
    };

    playPause = () => {
        this.setState({ playing: !this.state.playing && !!this.props.url});
    };

    restart = () => {
        this.setState({ played: 0.0 });
        this.player && this.player.seekTo(0.0);
    };

    setVolume = (e: {value: number}) => {

        log('setVolume', 'new volume: %d', e.value);
        this.props.setVolume(e.value);
    };

    onSeekMouseDown = e => {
        if(this.props.url) {
            this.setState({seeking: true});
        }
    };

    onSeekChange = (e: {value: number}) => {
        if(this.props.url) {
            this.setState({ played: e.value });
        }
    };

    onSeekMouseUp = e => {
        if(this.props.url) {
            this.setState({seeking: false});
            this.player && this.player.seekTo(parseFloat(e.target.value));
        }
    };

    onProgress = state => {
        // We only want to update time slider if we are not currently seeking
        if (!this.state.seeking) {
            const {played} = state;

            if (played && played !== this.state.played) {
                this.setState({played});
            }

        }
    };

    onEnded = () => {
        this.setState({ playing: false, played: 0});
        this.nextSong();
        const modal = this.props.modal;
        if(modal) {
            modal.hide();
        }
    };

    onPause = () => {
        this.setState({ playing: false });
    };

    nextSong = () => {
        const { nextSong } = this.props;
        if(nextSong) {
            nextSong();
        }
    };

    renderAlbumLinkHeader() {
        const {artist, album, albumInfo, colAlbum, title, lyricsAvail} = this.props;
        const url = getLastFmThumbnail(albumInfo, LASTFM_IMG_SIZ_MEDIUM) || getCoverUrl(colAlbum);
        return (
            <div style={{float: 'left', width: '100%'}}>
                <AlbumLink artist={artist} album={album} >
                    { url ?
                        <img src={url} className="img-responsiv img-rounded"
                            style={{width: '100px', height: 'auto', float: 'left', marginRight: '10px'}}
                        />
                        :
                        <CdIcon />
                    }
                    <h3>{title}</h3>
                </AlbumLink>
                <button className="btn btn-default"
                    onClick={this.showLyrics} disabled={!lyricsAvail}>show lyrics</button>
            </div>
        );
    }

    renderDummyHeader() {
        return (
            <div style={{float: 'left', width: '100%'}}>
                <CdIcon />
                <h3>no song selected</h3>
            </div>
        );
    }

    render () {
        log('render', 'state: %o, props: %o', this.state, this.props);
        const { playing, played, duration, style } = this.state;
        const { url, volume, title } = this.props;

        let adjustedVol = volume===undefined ? 0.8 : volume;
        adjustedVol = Math.max(Math.min(adjustedVol , 1.0), 0.0);
        log('render', 'volume=', volume, 'adjustedVol', adjustedVol, Number.isNaN(volume), Number.isNaN(volume) ? 0.8 : volume);
        return (
            <div className="panel panel-default">
                <div className="panel-heading clearfix">
                    { title ? this.renderAlbumLinkHeader() : this.renderDummyHeader() }
                </div>
                <div className="panel-body">
                    <div style={{height: '50px', marginBottom: '5px'}}>
                        <LevelMeter audio={this.player && this.player.getAudio()}
                            backgroundColor={style && style.backgroundColor}
                            okColor={style && style.successColor}
                            alarmColor={style && style.dangerColor}
                            warnColor={style && style.warningColor}
                            textColor={style && style.defaultColor}
                        />
                    </div>
                    <AudioPlayer
                        ref={player => this.player = player}
                        hidden={true}
                        url={url}
                        playing={playing}
                        volume={adjustedVol}
                        onPlay={() => this.setState({ playing: true })}
                        onPause={ this.onPause }
                        onEnded={ this.onEnded }
                        onProgress={this.onProgress}
                        onDuration={duration => this.setState({ duration })}
                    />

                    <div className="row">
                        <div className="col-lg-5">
                            <div className="row">
                                <div className="col-xs-4">
                                    <Button onClick={this.restart}>
                                        <RestartIcon/>
                                    </Button>
                                </div>
                                <div className="col-xs-4">
                                    <Button onClick={this.playPause}>
                                        <PlayIcon playing={playing}/>
                                    </Button>
                                </div>
                                <div className="col-xs-4">
                                    <Button onClick={this.nextSong}>
                                        <PlayNextIcon/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row">
                                <div className="col-xs-4">
                                    <strong>duration: &nbsp;</strong>
                                    <Duration seconds={duration} />
                                </div>
                                <div className="col-xs-4">
                                    <strong>remaining: &nbsp;</strong>
                                    <Duration seconds={duration * (1 - played)} />
                                </div>
                                <div className="col-xs-4">
                                    <strong>elapsed: &nbsp;</strong>
                                    <Duration seconds={duration * played} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        &nbsp;
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="form-group">
                                <Slider
                                    id="player-volume"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={adjustedVol}
                                    onChange={this.setVolume} />
                                <label htmlFor="player-volume">Volume</label>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="form-group">
                                <Slider id="player-seek"
                                    min={0} max={1} step={0.01}
                                    value={played}
                                    disabled={ !url }
                                    onMouseDown={this.onSeekMouseDown}
                                    onChange={this.onSeekChange}
                                    onMouseUp={this.onSeekMouseUp}
                                />
                                <label htmlFor="player-seek">Seek</label>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="form-group">
                                <ProgressBar id="play-progress-bar" maxValue={1} value={played} text={format(duration * played)}/>
                                <label htmlFor="player-played">Played</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const { playlist } = state;
    const {artist, album, song, url} = playlist[0] || {};
    const title = artist && song ? `${artist} :  ${song}` : '';
    const lyrics = getLyrics(state);
    return {
        url: createAudioUrls(url),
        artist,
        album,
        song,
        title,
        volume: getValueFromSettings(state, 'volume'),
        albumInfo: getAlbumInfo(state, artist, album),
        colAlbum: getAlbumByName(state, artist, album),
        lyricsAvail: !(lyrics && lyrics.error)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setVolume: volume => dispatch(setVolume(volume)),
    nextSong: () => dispatch(removeSongAtIndexFromPlaylist(0)),
    requestAlbum: (artist: string, album: string) => dispatch(requestAlbumIfNotExists(artist, album)),
    sendNotification: (head: string, msg?: string) => dispatch(sendNotification(head, msg)),
    requestSongLyricsIfNotExists: (artist, song) => dispatch(requestSongLyricsIfNotExists(artist, song))
});

export default connect(mapStateToProps, mapDispatchToProps)(Player);

