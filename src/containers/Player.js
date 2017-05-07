import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { removeSongAtIndexFromPlaylist } from '../actions/playlistActions';
import { sendNotification } from '../actions/notificationsActions';
import { requestAlbumIfNotExists } from '../actions/lastFmActions';
import { setVolume } from '../actions/settingsActions';
import { getAlbumInfo, getAlbumByName, getValueFromSettings } from '../reducers';

import AudioPlayer from '../components/AudioPlayer';
import Slider from '../components/Slider';
import ProgressBar from '../components/ProgressBar';
import GlyphIcon from '../components/GlyphIcon';
import NavLink from '../components/NavLink';
import LevelMeter from '../components/LevelMeter';
import { createLinkUrl, sendDesktopNotification, getLastFmThumbnail, getCoverUrl, createMp3Url, createLog,
        LASTFM_IMG_SIZ_MEDIUM } from '../components/utils';

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

function format (seconds) {

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

function Duration ({ className, seconds }) {
    return (
        <time dateTime={`P${Math.round(seconds)}S`} className={className}>
            {format(seconds)}
        </time>
    );
}

function AlbumLink({artist, album, children, activate}) {
    if(artist && album) {
        return (
            <NavLink activate={activate} to={createLinkUrl(artist, album)} style={{}}>
                {children}
            </NavLink>
        );
    }
    return null;
}

class Player extends Component {

    constructor(props) {
        log('constructor', props);
        super(props);
        this.state = {
            playing: !!this.props.url,
            played: 0,
            duration: 0
        };

        if(this.state.playing && props.title) {
            if(props.artist && props.album) {
                this.props.requestAlbum(props.artist, props.album);
            }
            sendDesktopNotification('Now playing:', props.title);
            props.sendNotification('Now playing:', props.title);
        }
    }

    componentDidMount() {
        log('componentDidMount');
        const bodyStyle = window.getComputedStyle(document.body);
        this.backgroundColor = bodyStyle.getPropertyValue('--main-heading-bg');
        this.defaultColor = bodyStyle.getPropertyValue('--main-default-color');
        this.successColor = bodyStyle.getPropertyValue('--main-success-color');
        this.warningColor = bodyStyle.getPropertyValue('--main-warning-color');
        this.dangerColor = bodyStyle.getPropertyValue('--main-danger-color');
    }

    componentWillReceiveProps(nextProps){
        log('componentWillReceiveProps', nextProps, this.props);
        if(this.props.url !== nextProps.url) {
            const newState = {playing: !!nextProps.url};
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

    playPause = () => {
        this.setState({ playing: !this.state.playing && !!this.props.url});
    };

    restart = () => {
        this.setState({ played: 0.0 });
        this.player.seekTo(0.0);
    };

    setVolume = e => {
        log('setVolume', e.target.value);
        this.props.setVolume(e.target.value);
    };

    onSeekMouseDown = e => {
        if(this.props.url) {
            this.setState({seeking: true});
        }
    };

    onSeekChange = e => {
        if(this.props.url) {
            this.setState({ played: parseFloat(e.target.value) });
        }
    };

    onSeekMouseUp = e => {
        if(this.props.url) {
            this.setState({seeking: false});
            this.player.seekTo(parseFloat(e.target.value));
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

    renderThumbnail() {
        const {artist, album, albumInfo, colAlbum, title} = this.props;
        const url = getLastFmThumbnail(albumInfo, LASTFM_IMG_SIZ_MEDIUM) || getCoverUrl(colAlbum);
        return (

            <div style={{float: 'left', width: '100%'}}>
                <AlbumLink artist={artist} album={album} activate={false}>
                    { url ?
                        <img src={url} className="img-responsiv img-rounded"
                             style={{width: '100px', height: 'auto', float: 'left', marginRight: '10px'}}
                        />
                        :
                        <CdIcon />
                    }
                    <h3>{title}</h3>
                </AlbumLink>
            </div>
        );
    }

    render () {
        log('render', this.state, this.props);
        const {
            playing, played, duration
        } = this.state;

        const { url, volume } = this.props;
        let adjustedVol = volume===undefined ? 0.8 : volume;
        adjustedVol = Math.max(Math.min(adjustedVol , 1.0), 0.0);
        log('render', 'volume=', volume, 'adjustedVol', adjustedVol, Number.isNaN(volume), Number.isNaN(volume) ? 0.8 : volume);
        return (
            <div className="panel panel-default">
                <div className="panel-heading clearfix">
                    {this.renderThumbnail()}
                </div>
                <div className="panel-body">
                    <div style={{height: '50px', marginBottom: '5px'}}>
                        <LevelMeter audio={this.player && this.player.getAudio()}
                                    backgroundColor={this.backgroundColor}
                                    okColor={this.successColor}
                                    alarmColor={this.dangerColor}
                                    warnColor={this.warningColor}
                                    textColor={this.defaultColor}
                        />
                    </div>
                    <AudioPlayer
                        ref={player => { this.player = player; }}
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
                                <ProgressBar maxValue={1} value={played} text={format(duration * played)}/>
                                <label htmlFor="player-played">Played</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


Player.propTypes = {
    url: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    song: PropTypes.string,
    title: PropTypes.string,
    albumInfo: PropTypes.object,
    colAlbum: PropTypes.object,
    nextSong: PropTypes.func,
    requestAlbum: PropTypes.func,
    sendNotification: PropTypes.func
};

const mapStateToProps = state => {
    const { playlist } = state;
    const {artist, album, song, url} = playlist[0] || {};
    const title = artist && song ? `${artist} :  ${song}` : '';
    return {
        url: createMp3Url(url),
        artist,
        album,
        song,
        title,
        volume: getValueFromSettings(state, 'volume'),
        albumInfo: getAlbumInfo(state, artist, album),
        colAlbum: getAlbumByName(state, artist, album)
    };
};

const mapDispatchToProps = dispatch => ({
    setVolume: volume => dispatch(setVolume(volume)),
    nextSong: () => dispatch(removeSongAtIndexFromPlaylist(0)),
    requestAlbum: (artist, album) => dispatch(requestAlbumIfNotExists(artist, album)),
    sendNotification: (head, msg) => dispatch(sendNotification(head, msg))
});

export default connect(mapStateToProps, mapDispatchToProps)(Player);

