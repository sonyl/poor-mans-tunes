/* global process:false */

const config = {
    develop: {
        contextRoot: '',
        baseUrl:  'http://localhost:9000',
        collectionUrl: '/public/files.json'
    },

    test: {
        contextRoot: '',
        baseUrl:  'http://localhost:9000',
        collectionUrl: 'http://dummy/files.json'
    },

    production: {
        contextRoot: '/~gerhard/poor-mans-tunes',
        baseUrl: 'http://www',
        collectionUrl: '/~gerhard/poor-mans-tunes/files.json'
    }
};


export default function getConfig(defaults = {}) {
    return Object.assign(defaults, config[process.env.NODE_ENV || 'develop']);
}