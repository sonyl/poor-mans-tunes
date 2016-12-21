import React, { Component, PropTypes }  from 'react';

import Button from 'grommet/components/Button';
import Meter from 'grommet/components/Meter';
import PlayIcon from 'grommet/components/icons/base/PlayFill';
import PauseIcon from 'grommet/components/icons/base/PauseFill';
import StopIcon from 'grommet/components/icons/base/StopFill';
import RefreshIcon from 'grommet/components/icons/base/Refresh';
import UpdateIcon from 'grommet/components/icons/base/Update';


import ReactPlayer from 'react-player';
import Slider from './Slider';

function MyPlayIcon(props) {
    return props.playing ? <PauseIcon size='large'/> : <PlayIcon size='large'/>;
}

function MyStopIcon() {
    return <StopIcon size='large'/>;
}

function LoopIcon(props) {
    return props.loop ? <UpdateIcon size='large'/> : <RefreshIcon size='large'/>;
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
    constructor(props) {
        super(props);
        this.state = {
            playing: true,
            loop: false,
            volume: 0.8,
            played: 0,
            duration: 0
        };
    }

    componentWillReceiveProps(nextProps){
        if(this.props.url !== nextProps.url && !this.state.playing) {
            this.setState({playing: true});
        }
    }

    playPause() {
        this.setState({ playing: !this.state.playing });
    }

    toggleLoop() {
        this.setState({ loop: !this.state.loop });
    }

    stop() {
        this.setState({ url: null, playing: false });
    }
    setVolume(e) {
        console.log('setVolume:', e.target.value);
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
        if(this.state.loop) {
            this.setState({ playing: true });
        }
    }
    onPause() {
        console.log('onPause');
        this.setState({ playing: false });
    }

    render () {
        const {
            playing, volume, played, duration, loop
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
                        onPause={ this.onPause.bind(this) }
                        onBuffer={() => console.log('onBuffer')}
                        onEnded={this.onEnded.bind(this)}
                        onError={e => console.log('onError', e)}
                        onProgress={this.onProgress.bind(this)}
                        onDuration={duration => this.setState({ duration })}
                    />

                    <table><tbody>
                    <tr>
                        <td>
                            <Button onClick={this.stop.bind(this)}>
                                <MyStopIcon/>
                            </Button>
                            &nbsp;
                            <Button onClick={this.playPause.bind(this)}>
                                <MyPlayIcon playing={playing}/>
                            </Button>
                            &nbsp;
                            <Button onClick={this.toggleLoop.bind(this)}>
                                <LoopIcon loop={loop}/>
                            </Button>
                        </td>
                    </tr>
                    <tr>
                        <th>Seek</th>
                        <td>
                            <Slider
                                min={0} max={1} step={0.01}
                                value={played}
                                onMouseDown={this.onSeekMouseDown.bind(this)}
                                onChange={this.onSeekChange.bind(this)}
                                onMouseUp={this.onSeekMouseUp.bind(this)}
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
                                onChange={this.setVolume.bind(this)} />
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

Player.propTypes = {
    url: PropTypes.string
};
