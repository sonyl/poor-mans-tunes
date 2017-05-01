import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import {rescan} from './scanner';

const PORT = 9001;
const COLLECTION = './collection.json';
const SETTINGS = './settings.json';

const DEFAULT_SETTINGS = {
    mp3Path: '../mp3'
};

const settings = function readSettings() {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
        return settings && settings.mp3Path ? settings : DEFAULT_SETTINGS;
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

app.get('/api/status', (req, res) => {
    console.log('status requested');
    fs.readFile(COLLECTION, 'utf8', (err, data) =>{
        if(err) {
            res.json({
                status: 'not ready'
            });
        } else {
            try {
                const collection = JSON.parse(data);

                res.json({
                    status: 'ready',
                    artists: collection.length,
                    albums:  collection.reduce((acc, val) => acc + val.albums.length, 0)
                });
            } catch(error) {
                res.status(500).json({
                    error: {
                        text: 'error parsing collection file',
                        detail: error
                    }
                });
            }
        }
    });
});


app.put('/api/status/rescan', (req, res) => {
    console.log('rescan requested');

    if(settings.mp3Path) {
        try {
            fs.unlinkSync(COLLECTION);
        } catch(error) {
            console.log("unable to delete: ", error);
        }
        rescan(settings.mp3Path).then(() => {
            express.
            staticFiles = express.static(settings.mp3Path);
        });
        res.json({ok: true});
    } else {
        res.status(500).json({
            error: 'settings incorrect, please specify mp3Path'
        });
    }
});

app.get('/api/settings', (req, res) => {
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
    if(req.body.value) {
        settings[req.params.key] = req.body.value;
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
    const rstream = fs.createReadStream(COLLECTION, 'utf8');
    rstream.on('error', err => {
        res.status(500).json({
            error: {
                text: 'error reading file',
                detail: err
            }
        });
    });
    rstream.pipe(res);
});

app.use('/mp3', (req, res) => {
    console.log('song requested!', req.url);
    const path = req.url;
    res.sendfile(path, {root: settings.mp3Path});
});

app.use((req, res) => {
    console.log('not found', req.url, req);
    res.status(404).json({
        errors: {
            global: 'Still working on it. Please try later'
        }
    });

});

app.listen(PORT, () => console.log('server is running on localhost:', PORT));
