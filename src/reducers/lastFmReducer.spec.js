/* eslint-env node, jest */

import { getAlbumInfo, getArtistInfo } from './lastFmReducer';

describe('lastFmReducer', () => {

    describe('getArtistInfo', () => {

        it('should return undefined if artist not found', () => {
            expect(getArtistInfo({}, 'The Artist')).toBeUndefined();
        });

        it('should return the info object if available', () => {
            expect(getArtistInfo({'The Artist': {__ARTIST_INFO: {info: 'test'}}}, 'The Artist')).toBe('test');
        });

    });

    describe('getAlbumInfo', () => {
        it('should return undefined if artist not found', () => {
            expect(getAlbumInfo({}, 'The Artist', 'The Album')).toBeUndefined();
        });

        it('should return the info object if available', () => {
            expect(getAlbumInfo({'The Artist': {'The Album': {info: 'test'}}}, 'The Artist', 'The Album')).toBe('test');
        });
    });
});