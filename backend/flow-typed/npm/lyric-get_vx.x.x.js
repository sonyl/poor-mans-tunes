// flow-typed signature: 48ce974b45817c3c7a1870a532c316ef
// flow-typed version: <<STUB>>/lyric-get_v^1.0.3/flow_v0.51.0


type LyricsGet = (artist: string, song: string, (error: ?Error, lyrics: string)=> void)=> void;

declare module 'lyric-get' {
    declare module.exports: {
        get: LyricsGet
    };
}

