import React, { Component, PropTypes }  from 'react';

import Button from 'grommet/components/Button';
import Meter from 'grommet/components/Meter';
import PlayIcon from 'grommet/components/icons/base/PlayFill';
import PauseIcon from 'grommet/components/icons/base/PauseFill';
import StopIcon from 'grommet/components/icons/base/StopFill';
import FFIcon from 'grommet/components/icons/base/FastForward';

import ReactPlayer from 'react-player';
import Slider from './Slider';

const ICON_SIZE = 'large';

function MyPlayIcon(props) {
    return props.playing ? <PauseIcon size={ICON_SIZE}/> : <PlayIcon size={ICON_SIZE}/>;
}

function MyStopIcon() {
    return <StopIcon size={ICON_SIZE}/>;
}

function Duration ({ className, seconds }) {
    function format (seconds) {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = pad(date.getUTCSeconds());
        if (hh) {
            return `${hh}:${pad(mm)}:${ss}`;
        }
        return `${mm}:${ss}`;
    }

    function pad (string) {
        return ('0' + string).slice(-2);
    }

    return (
        <time dateTime={`P${Math.round(seconds)}S`} className={className}>
            {format(seconds)}
        </time>
    );
}


export default class Player extends Component {

    static propTypes = {
        url: PropTypes.string,
        nextSong: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            playing: true,
            volume: 0.8,
            played: 0,
            duration: 0
        };

        this.playPause = this.playPause.bind(this);
        this.stop = this.stop.bind(this);
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
    stop() {
        this.setState({ url: null, playing: false });
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
        console.log('onEnded');
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

        const { url } = this.props;

        if(!url) {
            return null;
        }


        return (
            <div className='app'>
                <section className='section'>
                    <h1>Player:</h1>
                    <ReactPlayer
                        ref={player => { this.player = player; }}
                        className='react-player'
                        hidden={true}
                        url={url}
                        playing={playing}
                        volume={volume}
                        onReady={() => console.log('onReady')}
                        onStart={() => console.log('onStart')}
                        onPlay={() => this.setState({ playing: true })}
                        onPause={ this.onPause }
                        onBuffer={() => console.log('onBuffer')}
                        onEnded={this.onEnded}
                        onError={e => console.log('onError', e)}
                        onProgress={this.onProgress}
                        onDuration={duration => this.setState({ duration })}
                    />

                    <table><tbody>
                    <tr>
                        <td>
                            <Button onClick={this.stop}>
                                <MyStopIcon/>
                            </Button>
                            &nbsp;
                            <Button onClick={this.playPause}>
                                <MyPlayIcon playing={playing}/>
                            </Button>
                            &nbsp;
                            <Button onClick={this.nextSong}>
                                <FFIcon size={ICON_SIZE}/>
                            </Button>
                        </td>
                    </tr>
                    <tr>
                        <th>Seek</th>
                        <td>
                            <Slider
                                min={0} max={1} step={0.01}
                                value={played}
                                onMouseDown={this.onSeekMouseDown}
                                onChange={this.onSeekChange}
                                onMouseUp={this.onSeekMouseUp}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Volume</th>
                        <td>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={volume}
                                onChange={this.setVolume} />
                        </td>
                    </tr>
                    <tr>
                        <th>Played</th>
                        <td><Meter max={1} value={played} /></td>
                    </tr>
                    <tr>
                        <th>duration</th>
                        <td><Duration seconds={duration} /></td>
                    </tr>
                    <tr>
                        <th>elapsed</th>
                        <td><Duration seconds={duration * played} /></td>
                    </tr>
                    <tr>
                        <th>remaining</th>
                        <td><Duration seconds={duration * (1 - played)} /></td>
                    </tr>
                    </tbody></table>
                </section>
            </div>
        );
    }
}

