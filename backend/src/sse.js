/* @flow */
/* eslint-env node */

import { scanner } from './controller/Collection';

type Data = {} | string | number;

type Event = {
    data: Data,
    event?: string,
    id?: string | number,
    retry?: number
}

declare class ExtResponse extends restify$Response {
    SSEHandlers: {
        status: (Data)=> void,
        finish: (Data)=> void
    }
}

const buildEventStream = (events: Event | Event[]): string => {
    if (Array.isArray(events)) {
        return events.map(e => buildEventStream(e)).join('');
    }

    const {event, id, retry=1} = events;
    let data = events.data;
    let message = `retry: ${retry}\n`;

    if (id) {
        message += `id: ${id}\n`;
    }

    if (event) {
        message += `event: ${event}\n`;
    }

    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }

    message += `data: ${data}\n\n`;

    return message;
};

export default (req: restify$Request, res: ExtResponse, next: restify$NextFunction) => {
    console.log('initialiseSSE, res.finished=', res.finished);

    function statusHandler(event) {
        console.log('Scan statistics: %j', event);
        console.log('getStatsHandler, res.finished=', this.finished);
        this.write(buildEventStream({
            event: 'status',
            data: event
        }));
    }
    function finishHandler(event) {
        console.log('Scan finished: %j', event);
        this.write(buildEventStream({
            event: 'finish',
            data: event
        }));
        this.end();
        scanner.removeListener('status', this.SSEHandlers.status);
        scanner.removeListener('finish', this.SSEHandlers.finish);
        scanner.removeListener('error', this.SSEHandlers.finish);
    }

    res.SSEHandlers = {
        status: statusHandler.bind(res),
        finish: finishHandler.bind(res)
    };

    scanner.on('status', res.SSEHandlers.status);
    scanner.on('finish', res.SSEHandlers.finish);
    scanner.on('error', res.SSEHandlers.finish);

    res.header('Content-Type', 'text/event-stream');
    res.header('Cache-Control', 'no-cache');
    res.header('Connection', 'keep-alive');
    res.header('Access-Control-Allow-Origin', '*');
    res.write('retry: 10000\n\n');
};
