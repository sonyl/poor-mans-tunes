import React, {Component} from 'react';


class Song extends Component {

    render() {
        const classNames = this.props.isSelected ? 'selected' : '';

        return (
            <div id={this.props.id} onClick={(event) => this.onClick(event)} className={classNames}>
                {this.props.title}
            </div>
        );
    }

    onClick(event) {
        const target = event.currentTarget;
        const songId = target.id;
        const songIndex = songId.substring(3);
        console.log('Song selected:', songIndex);
        this.props.setSong(songIndex);
    }
}

export default class AlbumView extends Component {

    constructor(props) {
        super(props);
    }

    renderSongs() {
        const album = this.props.album;
        if(album && album.album && album.album.songs){
            return album.album.songs.map((s, i) => {
                const selected = this.props.currentSong.name === s.title;
                return <Song id={`so-${i}`}
                              key={s.title}
                              track={s.track}
                              isSelected={selected}
                              title={s.title}
                              setSong={this.props.setSong}/>;

            });
        }

    }

    render() {
        console.log('AlbumView.render:', this.props);
        return (
            <div>
                <h3>{this.props.album.name}</h3>
                { this.renderSongs() }
            </div>
        );
    }
}

