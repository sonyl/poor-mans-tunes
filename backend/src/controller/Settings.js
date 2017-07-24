/* @flow */
/* eslint-env node */

import fs from 'fs';
import path from 'path';

import type ScannerOptions from '../scanner/Scanner';
export type Settings = {audioPath: string, distPath: string, port: number, publicBaseUrl: string, scanOptions?: ScannerOptions};

const SETTINGS_FILE = path.join(__dirname, '../../settings.json');

const DEFAULT_PORT = 9000;

const DEFAULT_SETTINGS : Settings = {
    audioPath: '../mp3',
    distPath: '../dist',
    port: DEFAULT_PORT,
    publicBaseUrl: 'http://localhost:' + DEFAULT_PORT
};

const settings: Settings = function(): Settings {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        return settings && settings.audioPath ? settings : DEFAULT_SETTINGS;
    } catch(error) {
        console.log('Error reading settings: %j, using defaults', error);
        return DEFAULT_SETTINGS;
    }
}();
console.log('Using settings: %', settings);


const updateSettings = () => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 4), 'utf8');
        return true;
    } catch(error) {
        console.log('Error writings settings: %j', error);
        return false;
    }
};

const SettingsController = {
    get: (req: restify$Request, res: restify$Response, next: restify$NextFunction) => {
        res.json(settings);
        next();
    },

    put: (req: restify$Request, res: restify$Response, next: restify$NextFunction) => {
        console.log('Updated settings with %j, =>%j:', req.params, req.body.value);
        const key = req.params.key;
        let value = req.body.value;
        if (value) {
            if (key === 'audioPath') {
                if (value.endsWith('/')) {
                    value = value.slice(0, -1);
                }
            }
            settings[key] = value;
            if (updateSettings()) {
                res.json(settings);
            } else {
                res.json(500, {
                    error: 'could not persist settings',
                    settings
                });
            }
        } else {
            res.json(500, {
                error: 'empty value not allowed',
                settings
            });
        }
        next();
    },

    del: (req: restify$Request, res: restify$Response, next: restify$NextFunction) => {
        delete settings[req.params.key];
        console.log('Deleted parameter %j from settings =>%j:', req.params, settings);
        if(updateSettings()) {
            res.json(settings);
        } else {
            res.json(500, { error: 'could not persist settings', settings });
        }
        next();
    }
};

export default SettingsController;
export const getSettings = (): Settings => settings;