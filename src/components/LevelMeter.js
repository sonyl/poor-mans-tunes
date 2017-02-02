import React, { Component, PropTypes } from 'react';
import { createLog } from './utils';

const ENABLE_LOG = true;
const log = createLog(ENABLE_LOG, 'LevelMeter');


const DB_MIN_SCALE = -48;
const PEAK_BUFFER_SIZE = 50;
const MIN_LIN = Math.pow(10, DB_MIN_SCALE / 20);

function linToDb(lin) {
    return 20 * Math.log(Math.max(lin, MIN_LIN)) / Math.LN10;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

class RingBuffer {
    constructor(size = 100) {
        this.maxSize = size;
        this.buffer = Array(size).fill(DB_MIN_SCALE);
        this.ptr = 0;
    }

    write(value) {
        this.buffer[this.ptr] = isNumeric(value)  ? value : DB_MIN_SCALE;
        if (++this.ptr >= this.maxSize) {
            this.ptr = 0;
        }
    }

    getMax() {
        return this.buffer.reduce((m, v) => Math.max(m, v), DB_MIN_SCALE);
    }
}


export default class LevelMeter extends Component {
    constructor(props) {
        super(props);
        this.leftPeakBuffer = new RingBuffer(PEAK_BUFFER_SIZE);
        this.rightPeakBuffer = new RingBuffer(PEAK_BUFFER_SIZE);
    }


    componentDidMount() {
        log('componentDidMount', 'props=', this.props);
        this.connect(this.props);
    }

    componentWillUnmount() {
        this.disconnect();
    }

    componentWillReceiveProps (nextProps) {
        if(this.props.audio !== nextProps.audio) {
            log('componentWillReceiveProps', 'nextProps=', nextProps);
            if(this.props.audio) {
                this.disconnect();
            }
            if(nextProps.audio) {
                this.connect(nextProps);
            }
        }
    }

        /* this changing props has no effect on the rendering of the component */
    shouldComponentUpdate(nextProps) {
        return false;
    }

    audioOnPlay = (event) => {
        log('audioOnPlay', 'meterNode=%o sourceNode=%o', this.meterNode, this.sourceNode);
        this.meterNode && this.meterNode.disconnect();
        this.sourceNode && this.sourceNode.disconnect();

        const {audioContext, audio } = this.props;
        try {
            this.sourceNode = audioContext.createMediaElementSource(audio);
        } catch(error) {
            log('audioOnPlay', 'ERROR:', error);
        }
        this.sourceNode.connect(audioContext.destination);


        this.sourceNode.connect(this.meterNode);
        this.meterNode.connect(audioContext.destination);
    };

    connect( { audioContext, audio }) {
        log('connect');
        if(audio) {
            audio.addEventListener('play', this.audioOnPlay);
            this.sourceNode = audioContext.createMediaElementSource(audio);
            const channelCount = this.sourceNode.channelCount;
            this.meterNode = audioContext.createScriptProcessor(2048, channelCount, channelCount);
            this.meterNode.onaudioprocess = this.updateMeter;
            this.paintMeter();
        }
    }

    disconnect() {
        log('disconnect');
        this.props.audio.removeEventListener('play', this.audioOnPlay);

        this.meterNode && this.meterNode.disconnect();
        this.sourceNode && this.sourceNode.disconnect();
    }

    updateMeter = audioProcessingEvent => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        this.channelPeak = [];

        for (let channel = 0; channel < this.sourceNode.channelCount; channel++) {
            this.channelPeak[channel] = 0.0;
            const channelData = inputBuffer.getChannelData(channel);
            for (let sample = 0; sample < inputBuffer.length; sample++) {
                this.channelPeak[channel] = Math.max(this.channelPeak[channel], Math.abs(channelData[sample]));
            }
        }
    };

    paintMeter = () => {
        window.requestAnimationFrame(this.paintMeter);
        this.draw();
    };

    draw() {
        const  {canvas, leftPeakBuffer, rightPeakBuffer, channelPeak} = this;
        if(canvas && canvas.getContext && channelPeak) {
            const  {textColor, warnColor } = this.props;
            const w = canvas.width  = canvas.offsetWidth;
            const h = canvas.height = canvas.offsetHeight;

            const ctx = canvas.getContext('2d');

            const db_left = linToDb(channelPeak[0]);
            const db_right = linToDb(channelPeak[1]);
            this.drawBar(ctx, 0 , h * 0.05,  w, h * 0.4, 1 - db_left / DB_MIN_SCALE);
            this.drawBar(ctx, 0 , h * 0.55,  w, h * 0.4, 1 - db_right / DB_MIN_SCALE);

            leftPeakBuffer.write(db_left);
            rightPeakBuffer.write(db_right);

            const leftPeak = leftPeakBuffer.getMax().toPrecision(2);
            const rightPeak = rightPeakBuffer.getMax().toPrecision(2);

            if(leftPeak > DB_MIN_SCALE || rightPeak > DB_MIN_SCALE) {
                ctx.fillStyle = textColor || warnColor;
                ctx.font = '10px sans-serif';
                ctx.fillText(' ' + leftPeak + 'db', 0, h * 0.25);
                ctx.fillText(' ' + rightPeak + 'db', 0, h * 0.75);
            }
        }
    }

    drawBar(ctx, x, y, w, h, f) {

        ctx.fillStyle = this.props.backgroundColor;
        ctx.fillRect(x, y, w, h);

        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, this.props.okColor);
        grad.addColorStop(0.9, this.props.warnColor);
        grad.addColorStop(1, this.props.alarmColor);

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w * f, h);
    }

    render() {
        log('render', 'props=', this.props);
        return (
            <canvas ref={canvas => this.canvas = canvas} style={{ width: '100%', height: '100%' }} />
        );
    }

    static propTypes = {
        audioContext: PropTypes.object.isRequired,
        src: PropTypes.object,
        backgroundColor: PropTypes.string.isRequired,
        okColor: PropTypes.string.isRequired,
        warnColor: PropTypes.string.isRequired,
        alarmColor: PropTypes.string.isRequired,
        textColor: PropTypes.string                 // defaults to warnColor
    };

    static defaultProps = {
        audioContext: new (window.AudioContext || window.webkitAudioContext)(),
        backgroundColor: '#555',
        okColor: 'green',
        warnColor: 'yellow',
        alarmColor: 'red'
    };
}
