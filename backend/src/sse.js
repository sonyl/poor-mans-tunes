/* @flow */
/* eslint-env node */

export type SseEventData = {} | string | number | boolean;

export type SseEvent = {
    data: SseEventData,
    event?: string,
    id?: string | number,
    retry?: number
}

declare class _SseResponse extends express$Response {
    sendSseEvent: (event: SseEvent)=> void;
}

export type SseResponse = _SseResponse;

const createEventString = (events: SseEvent | SseEvent[]): string => {
    if (Array.isArray(events)) {
        return events.map(e => createEventString(e)).join('');
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
    if (typeof data === 'boolean') {
        data = data.toString();
    }

    message += `data: ${data}\n\n`;

    return message;
};

export default (req: express$Request, _res: express$Response, next: express$NextFunction) => {
    const res: SseResponse = (_res: any);
    console.log('initialiseSSE, res.finished=', res.finished);

    res.sendSseEvent = (event: SseEvent) => {
        res.write(createEventString(event));
    };

    req.socket.setTimeout(0); // no timeout
    res.header('Content-Type', 'text/event-stream');
    res.header('Cache-Control', 'no-cache');
    res.header('Connection', 'keep-alive');
    res.header('Access-Control-Allow-Origin', '*');
    res.write('retry: 10000\n\n');
    next();
};
