import React from 'react';

export default function SongView({artist, album, song}) {
    return (
        <h4>
            <span>{artist.name}</span>&nbsp;
            <span>{album.name}</span>&nbsp;
            <span>{song.name}</span>
        </h4>
    );
}