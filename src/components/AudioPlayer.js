import React, { Component, PropTypes } from 'react';

const ENABLE_LOG = true;
function log(method, fmt, ...args) {
    if(ENABLE_LOG) {
        console.log(`AudioPlayer.${method}() ${fmt}`, ...args);
    }
}

export default class AudioPlayer extends Component {

    static propTypes = {
        url: PropTypes.string,
        playing: PropTypes.bool,
        volume: PropTypes.number,
        hidden: PropTypes.bool,
        attributes: PropTypes.object,
        progressFrequency: PropTypes.number,
        onPlay: PropTypes.func,
        onPause: PropTypes.func,
        onEnded: PropTypes.func,
        onError: PropTypes.func,
        onProgress: PropTypes.func,
        onDuration: PropTypes.func
    };

    static defaultProps = {
        playing: false,
        volume: 0.8,
        hidden: false,
        attributes: {},
        progressFrequency: 1000,
        onPlay: function() {},
        onPause: function() {},
        onEnded: function() {},
        onError: function() {},
        onProgress: function() {},
        onDuration: function() {}
    };

    /* this instance variables have no effect on the rendering of the component ( no state needed )*/
    isReady = false;

    componentDidMount() {
        log('componentDidMount', 'props=', this.props);
        this.player.addEventListener('canplay', this.onReady);
        this.player.addEventListener('play', this.onPlay);
        this.player.addEventListener('pause', this.onPause);
        this.player.addEventListener('ended', this.onEnded);
        this.player.addEventListener('error', this.onError);
        this.player.setAttribute('webkit-playsinline', '');

        const { url } = this.props;
        if (url) {
            this.load(url);
        }
        this.progress();
    }

    componentWillUnmount() {

        this.player.removeEventListener('canplay', this.onReady);
        this.player.removeEventListener('play', this.onPlay);
        this.player.removeEventListener('pause', this.onPause);
        this.player.removeEventListener('ended', this.onEnded);
        this.player.removeEventListener('error', this.onError);

        this.stop();
        clearTimeout(this.progressTimeout);
    }

    componentWillReceiveProps (nextProps) {
        log('componentWillReceiveProps', 'nextProps=', nextProps);
        const { url, playing, volume} = this.props;
        // Invoke player methods based on incoming props
        if (url !== nextProps.url && nextProps.url) {
            this.load(nextProps.url);
        } else if (url && !nextProps.url) {
            this.load('');
            this.seekTo(0);
            this.stop();
        }
        if (!playing && nextProps.playing) {
            this.play();
        } else if (playing && !nextProps.playing) {
            this.pause();
        }
        if (volume !== nextProps.volume) {
            this.setVolume(nextProps.volume);
        }
    }

    /* this changing props has no effect on the rendering of the component */
    shouldComponentUpdate(nextProps) {
        return false;
    }

    onReady = () => {

        this.player.play();
        this.isReady = true;
        const duration = this.getDuration();

        if (duration) {
            this.props.onDuration(duration);
        }
    };


    onPlay = () => {
        this.props.onPlay();
    };

    onPause = () => {
        this.props.onPause();
    };

    onEnded = () => {
        this.props.onEnded();
    };

    onError = (evt) => {
        log('onError', 'evt=', evt);
        this.props.onError();
    };

    load (url) {
        log('load', 'url=', url);

        this.player.src = url;
        this.isReady = false;
    }

    play () {
        if(this.isReady) {
            this.player.play();
        }
    }

    pause () {
        this.player.pause();
    }

    stop () {
        this.player.removeAttribute('src');
    }

    setVolume (fraction) {
        this.player.volume = fraction;
    }

    getDuration () {
        return this.player.duration;
    }

    getFractionPlayed () {
        if (!this.isReady) return null;
        return this.player.currentTime / this.getDuration();
    }

    getFractionLoaded () {
        if (!this.isReady || this.player.buffered.length === 0) return null;
        return this.player.buffered.end(0) / this.getDuration();
    }

    seekTo = fraction => {
        if(this.isReady) {
            // When seeking before player is ready, store value and seek later
            const currentTime = this.getDuration() * fraction;
            this.player.currentTime = currentTime;
        }
    };

    getAudio() {
        return this.player;
    }

    progress = () => {
        if (this.props.url && this.player) {
            const loaded = this.getFractionLoaded() || 0;
            const played = this.getFractionPlayed() || 0;
            const progress = {};
            if (loaded !== this.prevLoaded) {
                progress.loaded = loaded;
            }
            if (played !== this.prevPlayed) {
                progress.played = played;
            }
            if (progress.loaded || progress.played) {
                this.props.onProgress(progress);
            }
            this.prevLoaded = loaded;
            this.prevPlayed = played;
        }
        this.progressTimeout = setTimeout(this.progress, this.props.progressFrequency);
    };

    render () {
        log('render', 'props=', this.props);
        const { url, attributes, hidden, className, style } = this.props;

        const mediaStyle = {
            width: '100%',
            height: '100%',
            display: url ? 'block' : 'none'
        };
        return (
            <div style={{ ...style}} className={className} hidden={hidden}>
                <audio
                    ref={ player => this.player = player}
                    style={ mediaStyle }
                    preload='auto'
                    { ...attributes }
                />
            </div>
        );
    }
}