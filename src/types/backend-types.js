/* @flow */

export type Url = string[] | string;
export type CollectionInfo = { artists: number, albums: number} | { text: string, detail: string };
export type ScanStatistics = { percentDone: number, filesToScan: number, filesScanned: number };

export type ServerStatus = {
    status: string,
    scanning: boolean,
    collection?: CollectionInfo,

};

export type ServerSettings = {
    [string]: mixed
}

export type Song = {
    src: Url,
    title: string,
    track: number,
    year?: number,
    tt?: number,
    disk?: number,
    td?: number
};
export type Picture = {
    src: string,
    img?: string,
    format: string
};
export type Album = {
    album: string,
    artist: string,
    songs: Song[],
    picture?: Picture
};
export type Artist = {
    artist: string,
    albums: Album[]
};
export type Collection = Artist[];

export type Lyrics = {
    artist: string,
    song: string,
    lyrics: string,
    error?: string
}