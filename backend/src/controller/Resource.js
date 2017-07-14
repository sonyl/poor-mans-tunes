/* @flow */
/* eslint-env node */

import restifyPlugins from 'restify-plugins';
import { getSettings } from './Settings';
import { hasExtension } from '../scanner-utils';
import { scanFile } from './../scanner';


const getContentType = (type: string = ''): string => {
    const TYPES = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/bmp': ['bmp']
    };

    const lowType = type.toLowerCase();
    const matchType = Object.keys(TYPES).find(key => {
        return TYPES[key].indexOf(lowType) >= 0;
    });
    if(!matchType) {
        throw new Error('unknown media format');
    }
    return matchType;
};


const ResourceController = {
    getImage: (req: Object, res: Object, next: ()=> any) => {
        const imgFile = decodeURI(req.url.substr(4)); // remove '/img' from url
        const audioPath = getSettings().audioPath;

        if(hasExtension(imgFile, '.mp3', '.ogg')){
            scanFile(audioPath + imgFile)
                .then(meta => {
                    if(meta && meta.picture[0]) {
                        const pic = meta.picture[0];
                        res.setHeader('Content-Type', getContentType(pic.format));
                        res.send(pic.data);
                        next();
                    } else {
                        throw new Error('no artwork found');
                    }
                }).catch(error => {
                    res.json(500, { error: error.message });
                    next();
                });
        } else {
            return restifyPlugins.serveStatic({
                directory: audioPath,
                file: imgFile
            })(req, res, next);
        }
    },
    getAudio: (req: Object, res: Object, next: ()=> any) => {
        return restifyPlugins.serveStatic({
            directory: getSettings().audioPath,
            file: decodeURI(req.url.substr(6))  // remove '/audio' from url
        })(req, res, next);
    }
};

export default ResourceController;