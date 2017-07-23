/* @flow */
/* eslint-env node */
import restify from 'restify';
import restifyPlugins from 'restify-plugins';
import history from 'connect-history-api-fallback';
import SettingsController, { getSettings } from './controller/Settings';
import CollectionController, {scanner} from './controller/Collection';
import ResourceController from './controller/Resource';
import SonosController from './controller/Sonos';
import LyricsController from './controller/Lyrics';

import Logger from 'bunyan';

const ENV = process.env.NODE_ENV || 'dev';
console.log('Poor-Mans-Tuns starting in %s environment.', ENV);


const log = new Logger({
    name: 'server',
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path: 'server.log',
            level: 'trace'
        }
    ],
    serializers: {
        req: Logger.stdSerializers.req,
        res: restify.bunyan.serializers.res
    }
});

const server = restify.createServer({
    name: 'Poor-mans-tunes-server',
    log
});


// server.acceptable.push('text/event-stream');
// server.use(restifyPlugins.acceptParser(server.acceptable));

server.pre((request, response, next) => {
    request.log.info({req: request}, 'start');
    return next();
});

server.on('after', function (req, res, route) {
    req.log.info({res: res}, 'finished');
});

server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.bodyParser());

server.use(history({
    verbose: ENV === 'production' ? false : true,
    rewrites: [{
        from: /.*\/bundle\.js$/,
        to: '/bundle.js'
    }, {
        from: /^\/app\/.*$/,
        to: '/index.html'
    }]
}));


server.get('/api/collection', CollectionController.get);
server.get('/api/collection/refreshes', CollectionController.getStatus);
server.put('/api/collection/refreshes', CollectionController.rescan);
server.get('/api/settings', SettingsController.get);
server.del('/api/settings/:key', SettingsController.del);
server.put('/api/settings/:key', SettingsController.put);
server.post('/api/sonos/play', SonosController.post);
server.get('/lyrics/:artist/:song', LyricsController.get);
server.get('/img/.*', ResourceController.getImage);
server.get('/audio/.*', ResourceController.getAudio);
server.get('/api/scanstats', initialiseSSE);

// fallback: serve static content
server.use(restifyPlugins.serveStatic({
    directory: getSettings().distPath,
    appendRequestPath: true
}));

server.listen(getSettings().port, () => console.log('%s listening at %s', server.name, server.url));

type Fields = {
    data: {} | string | number,
    event?: string,
    id?: string | number,
    retry?: number
}

function buildEventStream(fields: Fields | Fields[]) {
    if (Array.isArray(fields)) {
        return fields.map(fieldSet => buildEventStream(fieldSet)).join('');
    }

    const {event, id, retry=1} = fields;
    let data = fields.data;
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
}


function initialiseSSE(req, res, next) {
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
}