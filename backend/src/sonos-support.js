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

export const createAudioUrls = (publicBaseUrl, partUrls) => {
    const cvrt = partUrl => partUrl ? (publicBaseUrl + '/audio' + partUrl) : partUrl;

    return !partUrls ? partUrls : Array.isArray(partUrls) ? partUrls.map(cvrt) : cvrt(partUrls);
};

Sonos.prototype.play = promisify(Sonos.prototype.play);
Sonos.prototype.queueNext = promisify(Sonos.prototype.queueNext);

export const playSong = song => {
    const sonos = new Sonos(process.env.SONOS_HOST || '192.168.0.104');

    return sonos.queueNext(encodeURI(song)).then(() => sonos.play());
};
