/* @flow */
/* eslint-env node */
import { Sonos } from 'sonos';

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
