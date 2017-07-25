/* @flow */
/* eslint-env node */

import { getSettings } from './Settings';
import { hasExtension } from '../scanner/fs-scan-utils';
import Scanner from '../scanner/Scanner';


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
    getImage: (req: express$Request, res: express$Response) => {
        const imgFile = decodeURI(req.url.substr(4)); // remove '/img' from url
        const audioPath = getSettings().audioPath;

        if(hasExtension(imgFile, '.mp3', '.ogg')){
            Scanner.scanFile(audioPath + imgFile)
                .then(meta => {
                    if(meta && meta.picture[0]) {
                        const pic = meta.picture[0];
                        res.setHeader('Content-Type', getContentType(pic.format));
                        res.send(pic.data);
                    } else {
                        throw new Error('no artwork found');
                    }
                }).catch(error => {
                    res.status(500).json({ error: error.message });
                });
        } else {
            res.sendFile(imgFile, { root: audioPath });
        }
    },
    getAudio: (req: express$Request, res: express$Response) => {
        const file = decodeURI(req.url.substr(6)); // remove '/audio' from url
        res.sendFile(file, { root: getSettings().audioPath });
    }
};

export default ResourceController;