/* global process:false */

const config = {
    develop: {
        contextRoot: '',
        baseUrl:  'http://localhost:8080',
        collectionUrl: '/public/files.json'
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