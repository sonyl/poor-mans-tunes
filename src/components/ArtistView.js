import React from 'react';

function Album({id, album, isSelected, setAlbum}) {

    const classNames = isSelected ? "selected" : "";

    return (
        <div id={id} onClick={onClick} className={classNames}>
            {album.album}
        </div>
    );


    function onClick(event) {
        const target = event.currentTarget;
        const albumId = target.id;
        const albumIndex = albumId.substring(3);
        console.log("Album selected:", albumIndex);
        setAlbum(albumIndex);
    }
}

export default function ArtistView(props) {

    function renderAlbums() {
        const { artist, currentAlbum, setAlbum } = props;

        if(artist.albums && artist.albums.length) {
            return artist.albums.map((a, i) => {
                const selected = currentAlbum.name === a.album;
                return <Album id={`al-${i}`}
                              key={a.album}
                              album={a}
                              isSelected={selected}
                              setAlbum={setAlbum}/>
            });
        }
    }

    console.log("ArtistView:", props);
    return (
        <div>
            <h2>{props.artist.artist}</h2>
            { renderAlbums() }
        </div>
    );
}
