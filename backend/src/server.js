/* @flow */
/* eslint-env node */
import fs from 'fs';
import restify from 'restify';
import restifyPlugins from 'restify-plugins';
import history from 'connect-history-api-fallback';
import path from 'path';
import getLyrics from './lyricsearch';
import {scanTree, scanFile, scanStats} from './scanner';
import fsp from './fs-promise';
import * as Sonos from './sonos-support';
import {hasExtension} from './scanner-utils';
import type { Collection, Artist, CollectionInfo, ServerStatus } from './types.js';
type Settings = {audioPath: string, distPath: string, port: number, publicBaseUrl: string}

const COLLECTION = './collection.json';
const NEW_COLLECTION = './collection.new.json';
const SETTINGS = './settings.json';
const DEFAULT_PORT = 9000;
let scanning = false;


const DEFAULT_SETTINGS : Settings = {
    audioPath: '../mp3',
    distPath: '../dist',
    port: DEFAULT_PORT,
    publicBaseUrl: 'http://localhost:' + DEFAULT_PORT
};

const settings = function readSettings(): Settings {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
        return settings && settings.audioPath ? settings : DEFAULT_SETTINGS;
    } catch(error) {
        console.log('Error reading settings: %j, using defaults', error);
        return DEFAULT_SETTINGS;
    }
}();

function updateSettings() {
    try {
        fs.writeFileSync(SETTINGS, JSON.stringify(settings, null, 4), 'utf8');
        return true;
    } catch(error) {
        console.log('Error writings settings: %j', error);
        return false;
    }
}

const ENV = process.env.NODE_ENV || 'dev';
console.log('Poor-Mans-Tuns starting in %s environment. Settings: %j', ENV, settings);

const server = restify.createServer({
    name: 'Poor-mans-tunes-server'
});
server.use((req, res, next) => {
    console.log('received request: %s %s %j', req.method, req.url, req.params);
    const nextRes = next();
    console.log('returning response: %j', nextRes);
    return nextRes;
});
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
server.use(restifyPlugins.bodyParser());


server.get('/api/status', (req: express$Request, res: express$Response) => {
    const full = 'full' === req.query.full || 'true' === req.query.full;
    console.log('status requested. full=', full);
    getStatus(full).then(status => {
        res.json(status);
    }).catch(err => {
        res.json({ error: err.message });
    });
});


server.put('/api/status/rescan', (req: express$Request, res: express$Response) => {
    console.log('rescan requested');

    if(!settings.audioPath) {
        res.status(500).json({
            error: 'settings incorrect, please specify audioPath'
        });
        return;
    } else if(scanning) {
        res.status(409).json({
            error: 'scan already running'
        });
        return;
    }

    try {
        fs.unlinkSync(NEW_COLLECTION);
    } catch(error) {
        // do nothing, this may happen
    }
    scanning = true;
    scanTree(settings.audioPath, NEW_COLLECTION).then(() => {
        const currPath = path.resolve('.');
        fs.renameSync(path.normalize(currPath + '/' + NEW_COLLECTION), path.normalize(currPath + '/' + COLLECTION));
        scanning = false;
    }).catch(err => {
        scanning = false;
        console.log(`unable to scan tree: ${settings.audioPath}:`, err.message);
    });
    getStatus(false).then(status => {
        res.json(status);
    }).catch(err => {
        res.json({ error: err.message });
    });
});

server.get('/api/settings', (req: express$Request, res: express$Response) => {
    console.log('settings parameter requested');
    res.json(settings);
});

server.del('/api/settings/:key', (req: express$Request, res: express$Response) => {
    delete settings[req.params.key];
    console.log('Deleted parameter %j from settings =>%j:', req.params, settings);
    if(updateSettings()) {
        res.json(settings);
    } else {
        res.status(500).json({
            error: 'could not persist settings',
            settings
        });
    }
});

server.put('/api/settings/:key', (req: express$Request, res: express$Response) => {
    console.log('Updated settings with %j, =>%j:', req.params, req.body.value);
    const key = req.params.key;
    let value = req.body.value;
    if(value) {
        if(key === 'audioPath') {
            if(value.endsWith('/')) {
                value = value.slice(0, -1);
            }
        }
        settings[key] = value;
        if(updateSettings()) {
            res.json(settings);
        } else {
            res.status(500).json({
                error: 'could not persist settings',
                settings
            });
        }
    } else {
        res.status(400).json({
            error: 'empty value not allowed',
            settings
        });
    }
});

server.post('/api/sonos/play', (req: express$Request, res: express$Response) => {
    console.log('Api sonos play =>%j:', req.body);
    const src:string = Array.isArray(req.body.src) ? req.body.src[0] : req.body.src;
    if(src) {
        Sonos.playSong(Sonos.createAudioUrl(settings.publicBaseUrl, src)).then(
            () => {
                console.log('Successfully started song on sonos:', src);
                res.json({
                    status: 'ok'
                });
            },
            err => {
                console.log('Error starting song on sonos:', err);
                res.status(500).json({
                    error: err.message || err
                });
            });
    } else {
        res.status(400).json({
            error: 'empty src not allowed'
        });
    }
});

server.get('/api/collection', restifyPlugins.serveStatic({
    directory: path.join(__dirname, '..'),
    file: 'collection.json'
}));

server.get('/img/.*', (req: express$Request, res: express$Response) => {
    const imgPath = decodeURI(req.url.substr(4));
    console.log('image request', imgPath);

    if(hasExtension(imgPath, '.mp3', '.ogg')){
        scanFile(settings.audioPath + imgPath)
            .then(meta => {
                if(meta && meta.picture[0]) {
                    const pic = meta.picture[0];
                    res.set('Content-Type', getContentType(pic.format));
                    res.send(pic.data);
                } else {
                    throw new Error('no artwork found');
                }
            }).catch(error => {
                res.status(500).json({
                    error: error.message
                });
            });
    } else {
        res.sendFile(imgPath, {root: settings.audioPath});
    }

});

server.get('/audio/.*', (req, res, next) => {
    return restifyPlugins.serveStatic({
        directory: settings.audioPath,
        file: decodeURI(req.url.substr(6))  // remove '/audio' from url
    })(req, res, next);
});

server.get('/lyrics/:artist/:song', (req: express$Request, res: express$Response) => {
    const { artist, song } = req.params;
    console.log('lyrics requested: %s --- %s', artist, song);
    getLyrics(req.params.artist, req.params.song)
        .then(lyrics => {
            console.log('lyrics received: %j', lyrics);
            res.json(lyrics);
        })
        .catch(err => {
            console.log('lyrics error: %j', err);
            if(err==='not found') {
                res.status(404).json({error: err});
            } else {
                res.status(500).json({error: err.message || err});
            }
        });
});


server.use((req: express$Request, res: express$Response) => {
    console.log('resource requested: %s', req.url);
    res.sendFile(req.url, {root: settings.distPath}, error => {
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

server.use(restifyPlugins.serveStatic({
    directory: settings.distPath,
    appendRequestPath: true
}));

server.listen(settings.port, () => console.log('%s listening at %s', server.name, server.url));

function getContentType(type: string): string {
    type = type || '';
    if(['jpg', 'jpeg'].indexOf(type.toLowerCase()) >= 0) {
        return 'image/jpeg';
    }
    if(['png'].indexOf(type.toLowerCase()) >= 0) {
        return 'image/png';
    }
    throw new Error('unknown media format');
}

function getStatus(full: boolean): Promise<ServerStatus> {
    let promise;
    if(full) {
        promise = fsp.readFile(COLLECTION, 'utf8').
            then(data => {
                let collInfo:CollectionInfo;
                try {
                    const collection:Collection = JSON.parse(data);
                    collInfo = {
                        artists: collection.length,
                        albums: collection.reduce((acc: number, artist: Artist) => acc + artist.albums.length, 0)
                    };
                } catch (error) {
                    collInfo = {
                        text: 'error parsing collection file',
                        detail: error.message
                    };
                }
                return {
                    status: 'ready',
                    collection: collInfo
                };
            }, () => {
                return {
                    status: 'collection missing'
                };
            });
    } else {
        promise = fsp.stat(COLLECTION)
            .then(stats => ({ status: 'ready' }),
                err => ({ status: 'collection missing' }));
    }

    return promise.then((status: ServerStatus): ServerStatus => {
        status.scanning = scanning;
        status.scanStatistics = scanStats();
        return status;
    });
}