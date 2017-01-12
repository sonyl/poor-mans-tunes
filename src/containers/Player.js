import React, { Component, PropTypes }  from 'react';
import { connect } from 'react-redux';

import { removeFromPlaylist } from '../actions/playlistActions';
import { getSongUrl, getSongTitle } from '../reducers';

import ReactPlayer from 'react-player';
import Slider from '../components/Slider';
import ProgressBar from '../components/ProgressBar';
import GlyphIcon from '../components/GlyphIcon';

function PlayIcon(props) {
    return <GlyphIcon iconName={props.playing ? 'pause' : 'play'}/>;
}

function RestartIcon() {
    return <GlyphIcon iconName='step-backward'/>;
}

function PlayNextIcon() {
    return <GlyphIcon iconName='fast-forward'/>;
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


class Player extends Component {

    constructor(props) {
        super(props);
        this.state = {
            playing: true,
            volume: 0.8,
            played: 0,
            duration: 0
        };

        this.playPause = this.playPause.bind(this);
        this.restart = this.restart.bind(this);
        this.setVolume = this.setVolume.bind(this);
        this.onSeekMouseDown = this.onSeekMouseDown.bind(this);
        this.onSeekChange = this.onSeekChange.bind(this);
        this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onEnded = this.onEnded.bind(this);
        this.onPause = this.onPause.bind(this);
        this.nextSong = this.nextSong.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(this.props.url !== nextProps.url && !this.state.playing) {
            this.setState({playing: true});
        }
    }

    playPause() {
        this.setState({ playing: !this.state.playing });
    }

    restart() {
        this.setState({ played: 0.0 });
        this.player.seekTo(0.0);
    }

    setVolume(e) {
        this.setState({ volume: parseFloat(e.target.value) });
    }

    onSeekMouseDown(e) {
        this.setState({ seeking: true });
    }

    onSeekChange(e) {
        this.setState({ played: parseFloat(e.target.value) });
    }

    onSeekMouseUp(e) {
        this.setState({ seeking: false });
        this.player.seekTo(parseFloat(e.target.value));
    }

    onProgress(state) {

        // We only want to update time slider if we are not currently seeking
        if (!this.state.seeking) {
            const {played} = state;

            if (played && played !== this.state.played) {
                this.setState({played});
            }

        }
    }

    onEnded() {
        this.setState({ playing: false });
        this.nextSong();
    }

    onPause() {
        this.setState({ playing: false });
    }

    nextSong() {
        const { nextSong } = this.props;
        if(nextSong) {
            nextSong();
        }
    }

    render () {
        const {
            playing, volume, played, duration
        } = this.state;

        const { url, title } = this.props;
        const songtitle = title && <span><small> </small><h3>{title}</h3></span>;

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-md-12"><h3>Player:</h3></div>
                    </div>
                    <div className="row">
                        <div className="col-md-12"><h4>{title}</h4></div>
                    </div>
                </div>
                <div className="panel-body">
                    <ReactPlayer
                        ref={player => { this.player = player; }}
                        className='react-player'
                        hidden={true}
                        url={url}
                        playing={playing}
                        volume={volume}
                        onPlay={() => this.setState({ playing: true })}
                        onPause={ this.onPause }
                        onEnded={ this.onEnded }
                        onError={e => console.log('onError', e)}
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
                                    step={0.1}
                                    value={volume}
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
    title: PropTypes.string,
    nextSong: PropTypes.func
};

const mapStateToProps = state => {
    const { playlist } = state;
    return {
        url: getSongUrl(state, playlist[0] || {}),
        title: getSongTitle(state, playlist[0] || {})
    };
};

const mapDispatchToProps = dispatch => {

    const nextSong = () => dispatch(removeFromPlaylist(0));

    return { nextSong };
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);

