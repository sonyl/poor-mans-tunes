/* eslint-env node, jest */
import { replaceRequestPlaceholders, addRequestParams } from './utils';

expect.extend({
    toEqualOneOf(received, ...args) {
        if(!Array.isArray(args)) {
            throw new Error('array as second parameter expected');
        }
        const pass = args.reduce((acc, val) => acc |= val === received, false);
        if (pass) {
            return {
                message: () => (
                    `expected value to equal none of "${args.join('", "')}"\nreceived: "${received}"`
                ),
                pass: true
            };
        } else {
            return {
                message: () => (
                    `expected value to equal one of "${args.join('", "')}"\nreceived: "${received}"`
                ),
                pass: false
            };
        }
    }
});

describe('utils', () => {

    describe('replaceRequestPlaceholders', () => {
        it('should replace single placeholder', () => {
            const replaced = replaceRequestPlaceholders('http://foo/${res}/bar', {res: 'abc'});
            expect(replaced).toEqual('http://foo/abc/bar');
        });

        it('should replace duplicated placeholder', () => {
            const replaced = replaceRequestPlaceholders('http://foo/${res}/${res}', {res: 'abc'});
            expect(replaced).toEqual('http://foo/abc/abc');
        });

        it('should replace two duplicated placeholders', () => {
            const replaced = replaceRequestPlaceholders('http://${r2}${r1}/${r1}/${r2}', {r1: 'abc', r2: 'xyz'});
            expect(replaced).toEqual('http://xyzabc/abc/xyz');
        });
    });


    describe('addRequestParams', () => {
        it('should add nothing if argument is null or empty', () => {
            const replaced = addRequestParams('http://server', null);
            expect(replaced).toEqual('http://server/');

            const replaced2 = addRequestParams('http://server', undefined);
            expect(replaced2).toEqual('http://server/');
        });
        it('should add nothing if argument has no keys', () => {
            const replaced = addRequestParams('http://server', {});
            expect(replaced).toEqual('http://server/');
        });

        it('should add single parameter', () => {
            const replaced = addRequestParams('http://server', {abc: 'xyz'});
            expect(replaced).toEqual('http://server/?abc=xyz');
        });
        it('should add two parameters', () => {
            const replaced = addRequestParams('http://server/', {p1: 'abc', p2: 'xyz'});
            expect(replaced).toEqualOneOf('http://server/?p1=abc&p2=xyz', 'http://server/?p2=xyz&p1=abc');
        });
    });


});
