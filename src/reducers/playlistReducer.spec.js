/* eslint-env node, jest */

import { isPlaylistEmpty } from './playlistReducer';

describe('playlistReducer', () => {
    describe('isPlaylistEmpty', () => {

        it('should return true if playlist is empty', () => {
            expect(isPlaylistEmpty()).toBe(true);
            expect(isPlaylistEmpty([])).toBe(true);
        });

        it('should return false if playlist is not empty', () => {
            expect(isPlaylistEmpty([{}])).toBe(false);
        });

    });
});