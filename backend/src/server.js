/* @flow */
/* eslint-env node */
import express from 'express';
import bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';
import SettingsController, { getSettings } from './controller/Settings';
import CollectionController from './controller/Collection';
import ResourceController from './controller/Resource';
import SonosController from './controller/Sonos';
import LyricsController from './controller/Lyrics';
import initialiseSSE from './sse';


const ENV = process.env.NODE_ENV || 'dev';
console.log('Poor-Mans-Tuns starting in %s environment.', ENV);

const app = express();
app.use(bodyParser.json());
app.use(history({
    verbose: ENV === 'production' ? false : true,
    rewrites: [{
        from: /.*\/bundle\.js$/,
        to: '/bundle.js'
    }, {
        from: /^\/app\/.*$/,
        to: '/index.html'
    }]
}));

app.get('/api/collection', CollectionController.get);
app.get('/api/collection/refreshes', CollectionController.getStatus);
app.put('/api/collection/refreshes', CollectionController.rescan);
app.get('/api/settings', SettingsController.get);
app.delete('/api/settings/:key', SettingsController.del);
app.put('/api/settings/:key', SettingsController.put);
app.post('/api/sonos/play', SonosController.post);
app.get('/lyrics/:artist/:song', LyricsController.get);
app.get('/img/*', ResourceController.getImage);
app.get('/audio/*', ResourceController.getAudio);
app.get('/api/scanstats', initialiseSSE);

// fallback: serve static content
app.use((req: express$Request, res: express$Response) => {
    console.log('resource requested: %s', req.url);
    res.sendFile(req.url, {root: getSettings().distPath}, error => {
        if(error) {
            console.log('not found: ', error.message);
            res.status(404).json({
                errors: {
                    global: 'Still working on it. Please try later'
                }
            });
        }
    });
});

const server = app.listen(getSettings().port, () => {
    const address = server.address();
    console.log('listening at %s %s', address.address, address.port);
});