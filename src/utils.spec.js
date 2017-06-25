/* @flow */
/* eslint-env node, jest */
import { urlsEqual, createAudioUrls, createAudioUrl } from './utils';

describe('urlsEqual', () => {
    it('should return true, if both args are equal strings', () => {
        expect(urlsEqual('abc', 'abc')).toBe(true);
    });
    it('should return false, if both args are unequal strings', () => {
        expect(urlsEqual('abc', 'abe')).toBe(false);
    });
    it('should return true, if both args are falsy', () => {
        expect(urlsEqual((null: any), (undefined: any))).toBe(true);
        expect(urlsEqual((null: any), '')).toBe(true);
        expect(urlsEqual((undefined: any), '')).toBe(true);
        expect(urlsEqual((undefined: any), (false: any))).toBe(true);
    });
    it('should return false, if one arg is undefined, the other a string', () => {
        expect(urlsEqual((undefined: any), 'yes')).toBe(false);
    });
    it('should return false, if one arg is string, the other a array', () => {
        expect(urlsEqual('yes', ['abc'])).toBe(false);
    });
    it('should return false, if both args are arrays, different length', () => {
        expect(urlsEqual(['abc'], ['abc', 'efg'])).toBe(false);
    });
    it('should return true, if both args are empty array', () => {
        expect(urlsEqual([], [])).toBe(true);
    });
    it('should return true, if both args are arrays with same string elements', () => {
        expect(urlsEqual(['abc'], ['abc'])).toBe(true);
        expect(urlsEqual(['abc', 'xyz'], ['abc', 'xyz'])).toBe(true);
    });
});

describe('createAudioUrls', () => {
    it('should return undefined, if no parameter provided', () => {
        expect(createAudioUrls((undefined: any))).toBeUndefined();
    });
    it('should return converted url, if parameter is single partial url', () => {
        expect(createAudioUrls('/foo/bar.txt')).toEqual('http://localhost:9000/audio/foo/bar.txt');
    });
    it('should return converted urls in array, if parameter is array with partial urls', () => {
        expect(createAudioUrls(['/foo/bar.txt', (null: any), '/foo/baz.txt']))
            .toEqual(['http://localhost:9000/audio/foo/bar.txt', null, 'http://localhost:9000/audio/foo/baz.txt']);
    });
});

describe('createAudioUrl', () => {
    it('should return undefined, if no parameter provided', () => {
        expect(createAudioUrl((undefined: any), '.mp3')).toBeUndefined();
    });
    it('should return converted url, if parameter is single partial url', () => {
        expect(createAudioUrl('/foo/bar.mp3', 'mp3')).toEqual('http://localhost:9000/audio/foo/bar.mp3');
    });
    it('should return converted url, if parameter is single partial url and format does not match', () => {
        expect(createAudioUrl('/foo/bar.mp3', '.txt')).toEqual('http://localhost:9000/audio/foo/bar.mp3');
    });
    it('should return converted url, if parameter is array and format not does not match', () => {
        expect(createAudioUrl([(null: any), '/foo/bar.mp3'], '.txt')).toEqual('http://localhost:9000/audio/foo/bar.mp3');
    });
    it('should return converted url, if parameter is array and format not does match', () => {
        expect(createAudioUrl([(null: any), '/foo/bar.ogg', '/foo/bar.MP3'], '.mp3')).toEqual('http://localhost:9000/audio/foo/bar.MP3');
    });
    it('should return converted url, if parameter is array and format not does match', () => {
        expect(createAudioUrl([(null: any)], '.mp3')).toBeFalsy();
    });
});

