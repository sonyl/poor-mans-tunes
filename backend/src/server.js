/* @flow */
/* eslint-env node */
import restify from 'restify';
import restifyPlugins from 'restify-plugins';
import history from 'connect-history-api-fallback';
import SettingsController, { getSettings } from './controller/Settings';
import CollectionController from './controller/Collection';
import ResourceController from './controller/Resource';
import SonosController from './controller/Sonos';
import LyricsController from './controller/Lyrics';
import initialiseSSE from './sse';

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

server.pre((request: restify$Request, response: restify$Response, next: restify$NextFunction) => {
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