/* @flow */
/* eslint-env node */

import { Sonos } from 'sonos';
import { getSettings } from './Settings';

const promisify = f => {
    return function() {
        const self = this;
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push(function (err, data) {
                if (err) reject(err); else resolve(data);
            });
            f.apply(self, args);
        });
    };
};
Sonos.prototype.play = promisify(Sonos.prototype.play);
Sonos.prototype.queueNext = promisify(Sonos.prototype.queueNext);


export const createAudioUrl = (publicBaseUrl: string, partUrl: string): string => {
    const cvrt = (partUrl: string): string => publicBaseUrl + '/audio' + partUrl;
    return cvrt(partUrl);
};

export const playSong = (song: string): Promise<any>  => {
    const sonos = new Sonos(process.env.SONOS_HOST || '192.168.0.104');

    return sonos.queueNext(encodeURI(song)).then(() => sonos.play());
};


const SonosController = {

    post: (req: express$Request, res: express$Response) => {
        console.log('Api sonos play =>%j:', req.body);
        const src: string = Array.isArray(req.body.src) ? req.body.src[0] : req.body.src;
        if (src) {
            const url = createAudioUrl(getSettings().publicBaseUrl, src);
            playSong(url).then(
                () => {
                    console.log('Successfully started song on sonos: %s => %s', src, url);
                    res.json({
                        status: 'ok'
                    });
                },
                err => {
                    console.log('Error starting song on sonos:', err);
                    res.status(500).json({ error: err.message || err });
                });
        } else {
            res.status(400).json({ error: 'empty src not allowed' });
        }
    }
};

export default SonosController;

