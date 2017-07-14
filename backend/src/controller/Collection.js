/* @flow */
/* eslint-env node */

import fs from 'fs';
import path  from 'path';
import restifyPlugins from 'restify-plugins';
import fsp from '../fs-promise';
import { getSettings } from './Settings';
import {scanTree, scanStats} from '../scanner';

import type { Collection, Artist, CollectionInfo, ServerStatus } from '../types.js';


const COLLECTION = './collection.json';
const NEW_COLLECTION = './collection.new.json';

let scanning = false;

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


const CollectionController = {
    get: restifyPlugins.serveStatic({
        directory: path.join(__dirname, '../..'),
        file: 'collection.json'
    }),

    put: (req: Object, res: Object, next: ()=> any) => {
        console.log('rescan requested');
        const audioPath = getSettings().audioPath;
        if (!audioPath) {
            res.json(500, { error: 'settings incorrect, please specify audioPath' });
            next();
            return;
        } else if (scanning) {
            res.json(409, { error: 'scan already running' });
            next();
            return;
        }

        try {
            fs.unlinkSync(NEW_COLLECTION);
        } catch (error) {
            // do nothing, this may happen
        }
        scanning = true;

        scanTree(audioPath, NEW_COLLECTION).then(() => {
            const currPath = path.resolve('.');
            fs.renameSync(path.normalize(currPath + '/' + NEW_COLLECTION), path.normalize(currPath + '/' + COLLECTION));
            scanning = false;
        }).catch(err => {
            scanning = false;
            console.log(`unable to scan tree: ${audioPath}:`, err.message);
        });
        getStatus(false).then(status => {
            res.json(status);
            next();
        }).catch(err => {
            res.json({error: err.message});
            next();
        });
    },

    getStatus: (req: Object, res: Object, next: ()=> any) => {
        const full = 'full' === req.query.full || 'true' === req.query.full;
        console.log('status requested. full=', full);
        getStatus(full).then(status => {
            res.json(status);
            next();
        }).catch(err => {
            res.json({ error: err.message });
            next();
        });
    }
};

export default CollectionController;
