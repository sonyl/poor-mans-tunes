// flow-typed signature: de23c1bece431bd50b72c2cf0b03d263
// flow-typed version: <<STUB>>/lyric-get_v^1.0.3/flow_v0.56.0


type LyricsGet = (artist: string, song: string, (error: ?Error, lyrics: string)=> void)=> void;

declare module 'lyric-get' {
    declare module.exports: {
        get: LyricsGet
    };
}