import React, {PropTypes} from 'react';


const Song = ({id, isSelected, title, setSong}) => {

    const classNames = isSelected ? 'selected' : '';

    return (
        <div id={id} onClick={onClick} className={classNames}>
            {title}
        </div>
    );

    function onClick(event) {
        const target = event.currentTarget;
        const songId = target.id;
        const songIndex = songId.substring(3);
        setSong(songIndex);
    }
};

const AlbumView = ({album, currentSong, setSong}) =>  {

    function renderSongs () {
        if(album.album && album.album.songs){
            return album.album.songs.map((s, i) => {
                const selected = currentSong.name === s.title;
                return <Song id={`so-${i}`}
                              key={i}
                              track={s.track}
                              isSelected={selected}
                              title={s.title}
                              setSong={setSong}/>;
            });
        }
    }

    console.log('AlbumView.render()', album);
    return (
        <div>
            <h3>{album.name}</h3>
            { renderSongs() }
        </div>
    );
};

AlbumView.propTypes = {
    album: PropTypes.object.isRequired,
    currentSong: PropTypes.object.isRequired,
    setSong: React.PropTypes.func.isRequired
};


export default AlbumView;

