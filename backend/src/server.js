/* eslint-env node */
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';
import path from 'path';
import getLyrics from './lyricsearch';
import {scanTree, scanFile, scanStats} from './scanner';
import fsp from './fs-promise';
const COLLECTION = './collection.json';
const NEW_COLLECTION = './collection.new.json';
const SETTINGS = './settings.json';
let scanning = false;
const DEFAULT_SETTINGS = {
    audioPath: '../mp3',
    distPath: '../dist',
    port: 9000
};

const settings = function readSettings() {
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
    }catch(error) {
        console.log('Error writings settings: %j', error);
        return false;
    }
}

console.log('Settings: %j', settings);

const app = express();
app.use(bodyParser.json());
app.use(history({
    verbose: true,
    rewrites: [{
        from: /.*\/bundle\.js$/,
        to: '/bundle.js'
    }, {
        from: /^\/app\/.*$/,
        to: '/index.html'
    }]
}));

app.get('/api/status', (req, res) => {
    const full = 'full' === req.query.full || 'true' === req.query.full;
    console.log('status requested. full=', full);
    getStatus(full).then(status => {
        res.json(status);
    }).catch(err => {
        res.json({ error: err.message });
    });
});


app.put('/api/status/rescan', (req, res) => {
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
        express.staticFiles = express.static(settings.audioPath);
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

app.get('/api/settings', (req, res) => {
    console.log('settings parameter requested');
    res.json(settings);
});

app.delete('/api/settings/:key', (req, res) => {
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

app.put('/api/settings/:key', (req, res) => {
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

app.get('/api/collection', (req, res) => {
    console.log('collection requested!');
    res.sendFile(COLLECTION, {root: __dirname + '/..'});
});

function getContentType(type) {
    type = type || '';
    if(['jpg', 'jpeg'].indexOf(type.toLowerCase()) >= 0) {
        return 'image/jpeg';
    }
    if(['png'].indexOf(type.toLowerCase()) >= 0) {
        return 'image/png';
    }
    throw new Error('unknown media format');
}

app.get('/img/*', (req, res) => {
    const imgPath = decodeURI(req.url.substr(4));
    console.log('image request', imgPath);

    if(imgPath.endsWith('.mp3')){
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

app.get('/audio/*', (req, res) => {
    const path = decodeURI(req.url.substr(6));
    console.log('song requested!', path);
    res.sendFile(path, {root: settings.audioPath});
});

app.get('/lyrics/:artist/:song', (req, res) => {
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


app.use((req, res) => {
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

app.listen(settings.port, () => console.log('server is running on localhost:', settings.port));


function getStatus(full) {
    let promise;
    if(full) {
        promise = fsp.readFile(COLLECTION, 'utf8').
            then(data => {
                let collInfo = {};
                try {
                    const collection = JSON.parse(data);
                    collInfo = {
                        artists: collection.length,
                        albums: collection.reduce((acc, val) => acc + val.albums.length, 0)
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

    return promise.then(status => {
        status.scanning = scanning;
        status.scanStatistics = scanStats();
        return status;
    });
}