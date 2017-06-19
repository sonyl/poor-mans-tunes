/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createLog, urlsEqual } from './utils';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'AudioPlayer');

export default class AudioPlayer extends Component {

    player: HTMLMediaElement;
    progressTimeout: number;
    prevLoaded: number;
    prevPlayed: number;

    static propTypes = {
        url: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        playing: PropTypes.bool,
        volume: PropTypes.number,
        hidden: PropTypes.bool,
        className: PropTypes.string,
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
        className: '',
        attributes: {},
        progressFrequency: 1000,
        onPlay: function() {},
        onPause: function() {},
        onEnded: function() {},
        onError: function() {},
        onProgress: function(progres: {played?: number, loaded?: number}): void {},
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

        const { url } = this.props;
        if (url) {
            this.load(url);
        }
        this.progress();
        this.setVolume(this.props.volume);
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

    componentWillReceiveProps (nextProps: Object) {
        const { url, playing, volume} = this.props;
        // Invoke player methods based on incoming props
        const urlsChanged = !urlsEqual(url, nextProps.url);
        if (urlsChanged && nextProps.url) {
            log('componentWillReceiveProps', 'url set, url=', nextProps.url);
            this.load(nextProps.url);
        } else if (urlsChanged && !nextProps.url) {
            log('componentWillReceiveProps', 'url unset');
            this.load('');
            this.seekTo(0);
            this.stop();
        }
        if (!playing && nextProps.playing) {
            log('componentWillReceiveProps', 'start play');
            this.play();
        } else if (playing && !nextProps.playing) {
            log('componentWillReceiveProps', 'stop play');
            this.pause();
        }
        if (volume !== nextProps.volume) {
            log('componentWillReceiveProps', 'volume changed', nextProps.volume);
            this.setVolume(nextProps.volume);
        }
    }

    /* changing props has no effect on the rendering of the component */
    shouldComponentUpdate(nextProps: Object) {
        return false;
    }

    onReady = () => {
        log('onReady', 'canPlay event received, this.isReady=', this.isReady);
        this.player.play();
        this.isReady = true;
        const duration = this.getDuration();

        if (duration) {
            this.props.onDuration(duration);
        }
    };


    onPlay = () => {
        log('onPlay', 'canPlay event received, this.isReady=', this.isReady);
        this.props.onPlay();
    };

    onPause = () => {
        log('onPause', 'onPause event received, this.isReady=', this.isReady);
        this.props.onPause();
    };

    onEnded = () => {
        log('onEnded', 'onEnded event received, this.isReady=', this.isReady);
        this.props.onEnded();
    };

    onError = (e: Object) => {
        let reason;
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                reason = 'You aborted the video playback.';
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                reason = 'A network error caused the audio download to fail.';
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                reason = 'The audio playback was aborted due to a corruption problem or because the media used ' +
                            'features your browser did not support.';
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                reason = 'The media could not be loaded, either because the server or network failed or because ' +
                            'the format is not supported.';
                break;
            default:
                reason = 'An unknown error occurred.';
                break;
        }
        log('onError', 'reason=', reason, e);
        this.props.onError(reason);
    };

    load (urls: string[] | string) {
        log('load', 'url=', urls);
        if(Array.isArray(urls)) {
            urls.find(url => {
                log('load', 'multiple urls provided checking: %s', url);
                if(url.toLowerCase().endsWith('.ogg') && this.canPlay('ogg')) {
                    log('load', 'ogg format found and player can play ogg, url=%s', url);
                    this.player.src = url;
                    this.isReady = false;
                    return true;
                }
                if(url.toLowerCase().endsWith('.mp3') && this.canPlay('mp3')) {
                    log('load', 'mp3 format found and player can play mp3, url=%s', url);
                    this.player.src = url;
                    this.isReady = false;
                    return true;
                }
            });
        } else {
            this.player.src = urls;
            this.isReady = false;
        }
    }

    play () {
        log('play', 'this.ready=', this.isReady);

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

    setVolume (fraction: number) {
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

    seekTo = (fraction: number) => {
        if(this.isReady) {
            // When seeking before player is ready, store value and seek later
            const currentTime = this.getDuration() * fraction;
            this.player.currentTime = currentTime;
        }
    };

    getAudio() {
        return this.player;
    }

    canPlay(type: string) {
        const mimeTypes = {
            mp3: 'audio/mpeg;',
            ogg: 'audio/ogg; codecs="vorbis"'
        };
        const mimeType = mimeTypes[type];
        return !!(mimeType && this.player.canPlayType && this.player.canPlayType(mimeType).replace(/no/, ''));
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
        const { url, attributes, hidden, className } = this.props;

        const mediaStyle = {
            width: '100%',
            height: '100%',
            display: url ? 'block' : 'none'
        };
        return (
            <div className={className} hidden={hidden}>
                <audio
                    ref={ player => this.player = player }
                    style={ mediaStyle }
                    preload='auto'
                    { ...attributes }
                />
            </div>
        );
    }
}