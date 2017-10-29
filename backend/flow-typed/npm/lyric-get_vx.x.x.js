// flow-typed signature: 0e5b416c89daf4edeb53e6c35a429def
// flow-typed version: <<STUB>>/lyric-get_v^1.0.3/flow_v0.57.3


type LyricsGet = (artist: string, song: string, (error: ?Error, lyrics: string)=> void)=> void;

declare module 'lyric-get' {
    declare module.exports: {
        get: LyricsGet
    };
}