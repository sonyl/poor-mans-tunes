/* @flow */
/* global process:false */
/*
develop: {
    contextRoot: '',
        baseUrl:  'http://localhost:9000',
        collectionUrl: '/public/files2.json',
        lastFmBase: 'http://ws.audioscrobbler.com/2.0/'
},
*/
const config = {
    develop: {
        contextRoot: '',
        baseUrl:  'http://localhost:9000',
        //        collectionUrl: '/public/files2.json',
        collectionUrl: '/api/collection',
        lastFmBase: 'http://ws.audioscrobbler.com/2.0/',
        skipLastFmArtist: false,
        skipLastFmAlbum: true
    },

    test: {
        contextRoot: '',
        baseUrl:  'http://localhost:9000',
        collectionUrl: 'http://dummy/files.json',
        lastFmBase: 'http://dummy.home/2.0/'
    },

    production: {
        contextRoot: '',
        //       baseUrl: 'http://localhost:9001',
        collectionUrl: '/api/collection',
        lastFmBase: 'http://ws.audioscrobbler.com/2.0/'
    }
};

type Config={abc: string};

export default function getConfig(defaults: any = {}) {
    return Object.assign(defaults, config[process.env.NODE_ENV || 'develop']);
}