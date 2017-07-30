/* @flow */
/* eslint-env node */

import fs from 'fs';
import path  from 'path';
import fsp from '../fs-promise';
import { getSettings } from './Settings';
import Scanner from '../scanner/Scanner';

import type { Collection, Artist, CollectionInfo, ServerStatus } from '../types.js';
import type { SseResponse, SseEvent } from '../sse.js';

const COLLECTION = './collection.json';
const NEW_COLLECTION = './collection.new.json';

let scanning = false;

export const scanner = new Scanner(getSettings().scanOptions);

function getStatus(): Promise<ServerStatus> {
    return fsp.readFile(COLLECTION, 'utf8').
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
                scanning,
                collection: collInfo
            };
        }, () => {
            return {
                status: 'collection missing',
                scanning
            };
        });
}

interface MySseResponse extends SseResponse {
    SSEHandlers: {
        status: (SseEvent)=> any,
        finish: (SseEvent)=> any
    }
}


const CollectionController = {
    get: (req: express$Request, res: express$Response) => {
        console.log('collection requested!');
        res.sendFile(COLLECTION, {root: '.'});
    },

    rescan: (req: express$Request, res: express$Response) => {
        console.log('rescan requested');
        const audioPath = getSettings().audioPath;
        if (!audioPath) {
            res.status(500).json({ error: 'settings incorrect, please specify audioPath' });
            return;
        } else if (scanning) {
            // res.status(409).json({ error: 'scan already running' });
            // return;
            getStatus().then(status => {
                res.json(status);
            }).catch(err => {
                res.json({error: err.message});
            });
            return;
        }

        try {
            fs.unlinkSync(NEW_COLLECTION);
        } catch (error) {
            // do nothing, this may happen
        }
        scanning = true;

        scanner.scanTree(audioPath, NEW_COLLECTION).then(() => {
            const currPath = path.resolve('.');
            fs.renameSync(path.normalize(currPath + '/' + NEW_COLLECTION), path.normalize(currPath + '/' + COLLECTION));
            scanning = false;
        }).catch(err => {
            scanning = false;
            console.log(`unable to scan tree: ${audioPath}: %j`, err);
        });
        getStatus().then(status => {
            res.json(status);
        }).catch(err => {
            res.json({error: err.message});
        });
    },

    getStatus: (req: express$Request, res: express$Response) => {
        getStatus().then(status => {
            res.json(status);
        }).catch(err => {
            res.json({ error: err.message });
        });
    },


    sendEvents: (req: express$Request, _res: express$Response) => {
        const res: MySseResponse = (_res: any);

        console.log(res.sendSseEvent);

        function statusHandler(event) {
            console.log('Scan statistics: %j', event);
            console.log('getStatsHandler, res.finished=', this.finished);
            this.sendSseEvent({
                event: 'status',
                data: event
            });
        }
        function finishHandler(event) {
            console.log('Scan finished: %j', event);
            this.sendSseEvent({
                event: 'finish',
                data: event
            });
            res.end();
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

    }
};

export default CollectionController;
