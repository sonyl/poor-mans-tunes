/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createLog } from './utils';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'LevelMeter');


const DB_MIN_SCALE = -48;
const PEAK_BUFFER_SIZE = 40;
const MIN_LIN = Math.pow(10, DB_MIN_SCALE / 20);

function linToDb(lin) {
    return 20 * Math.log(Math.max(lin, MIN_LIN)) / Math.LN10;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

class RingBuffer {
    maxSize: number;
    buffer: number[];
    ptr: number;


    constructor(size = 100) {
        this.maxSize = size;
        this.buffer = Array(size).fill(DB_MIN_SCALE);
        this.ptr = 0;
    }

    write(value: number) {
        this.buffer[this.ptr] = isNumeric(value)  ? value : DB_MIN_SCALE;
        if (++this.ptr >= this.maxSize) {
            this.ptr = 0;
        }
    }

    getMax(): number {
        return this.buffer.reduce((m, v) => Math.max(m, v), DB_MIN_SCALE);
    }
}

type Props = {
    audio: HTMLMediaElement,
    audioContext: Object,
    backgroundColor: string,
    okColor: string,
    warnColor: string,
    alarmColor: string,
    textColor: string
};
type DefaultProps = {
    audioContext: Object,
    backgroundColor: '#555',
    okColor: 'green',
    warnColor: 'yellow',
    alarmColor: 'red',
};
type State = void;

export default class LevelMeter extends Component<DefaultProps, Props, State> {

    leftPeakBuffer: RingBuffer;
    rightPeakBuffer: RingBuffer;

    meterNode: Object;
    sourceNode: Object;

    canvas: HTMLCanvasElement;

    channelPeak: number[];

    constructor(props: Object) {
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

    componentWillReceiveProps (nextProps: Props) {
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
    shouldComponentUpdate(nextProps: Props) {
        return false;
    }

    audioOnPlay = (event: Event) => {
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

    connect( { audioContext, audio }: {audioContext: AudioContext, audio: HTMLMediaElement}) {
        log('connect', 'audio provided: %s', !!audio);
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
        log('disconnect', '');

        this.props.audio && this.props.audio.removeEventListener('play', this.audioOnPlay);
        this.meterNode && this.meterNode.disconnect();
        this.sourceNode && this.sourceNode.disconnect();
    }

    updateMeter = (audioProcessingEvent: any) => {
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
        if(canvas && channelPeak) {
            const ctx: ?CanvasRenderingContext2D = canvas.getContext ? canvas.getContext('2d') : undefined;
            if(ctx) {

                const w = canvas.width = canvas.offsetWidth;
                const h = canvas.height = canvas.offsetHeight;


                const db_left = linToDb(channelPeak[0]);
                const db_right = linToDb(channelPeak[1]);

                leftPeakBuffer.write(db_left);
                rightPeakBuffer.write(db_right);

                const leftPeak = (leftPeakBuffer.getMax(): number);
                const rightPeak = (rightPeakBuffer.getMax(): number);

                this.drawBar(ctx, 0, h * 0.05, w, h * 0.4, 1 - db_left / DB_MIN_SCALE,
                    h * 0.25, 1 - leftPeak / DB_MIN_SCALE, leftPeak);
                this.drawBar(ctx, 0, h * 0.55, w, h * 0.4, 1 - db_right / DB_MIN_SCALE,
                    h * 0.75, 1 - rightPeak / DB_MIN_SCALE, rightPeak);
            }
        }
    }

    drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: number, yCenter: number,
        xPeak: number, dbPeak: number) {
        ctx.fillStyle = this.props.backgroundColor;
        ctx.fillRect(x, y, w, h);

        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, this.props.okColor);
        grad.addColorStop(0.9, this.props.warnColor);
        grad.addColorStop(1, this.props.alarmColor);

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w * f, h);

        if(dbPeak > DB_MIN_SCALE) {
            ctx.beginPath();
            ctx.moveTo(w * xPeak, yCenter);
            ctx.lineTo(w * xPeak + 20, yCenter - 10);
            ctx.lineTo(w * xPeak + 20, yCenter + 10);
            //ctx.fillStyle=this.props.alarmColor;
            ctx.fill();

            const  {textColor, warnColor } = this.props;
            ctx.fillStyle = textColor || warnColor;
            ctx.font = '10px sans-serif';
            ctx.fillText(' ' + dbPeak.toPrecision(2) + 'db', 0, yCenter);
        }
    }

    render() {
        log('render', 'props=', this.props);
        return (
            <canvas ref={canvas => this.canvas = canvas} style={{ width: '100%', height: '100%' }} />
        );
    }

    static propTypes = {
        audioContext: PropTypes.object.isRequired,
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
