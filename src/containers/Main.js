import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchAllAlbums } from '../actions/albumsActions';
import { selectNewArtist, unselectArtist } from '../actions/artistActions';
import { selectNewAlbum, unselectAlbum } from '../actions/albumActions';
import { addToPlaylist, removeFromPlaylist } from '../actions/playlistActions';
import { getSongUrl } from '../reducers';
import findIndex from 'lodash/findIndex';

import Navbar from '../components/Navbar';
import ArtistList from '../components/ArtistList';
import ArtistView from '../components/ArtistView';
import AlbumView from '../components/AlbumView';
import PlaylistView from '../components/PlaylistView';
import Player from '../components/Player';

import ArtistSearch from './ArtistSearch';


function getArtistIndex(artists, artist) {
    return findIndex(artists, {artist});
}

function getAlbumIndex(albums, album) {
    return findIndex(albums, {album});
}


class Main extends Component {

    constructor(props) {
        super(props);

        this.addEntryToPlaylist = this.addEntryToPlaylist.bind(this);
        this.nextSong = this.removeEntryFromPlaylist.bind(this, 0);
        this.removeEntryFromPlaylist = this.removeEntryFromPlaylist.bind(this);
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(fetchAllAlbums());
    }

    componentWillReceiveProps(nextProps) {
        const {params, artists, selectedArtist, selectedAlbum, dispatch} = nextProps;
        console.log('Main.componentWillReceiveProps() nextProps:', nextProps, params, artists, params.artist);

        if(params.artist !== selectedArtist.name) {
            if(params.artist) {
                const index = getArtistIndex(artists, params.artist);
                if (index >= 0) {
                    dispatch(selectNewArtist(index, artists[index].artist));
                }
            } else {
                dispatch(unselectArtist());
            }

        }
        if(params.album !== selectedAlbum.name ) {
            if(params.album) {
                if(selectedArtist.index) {
                    const artist = artists[selectedArtist.index];
                    const index = getAlbumIndex(artist.albums, params.album);
                    if (index >= 0) {
                        dispatch(selectNewAlbum(index, artist.albums[index]));
                    }
                }
            } else {
                dispatch(unselectAlbum());
            }
        }
    }


    render() {
        console.log('Main.render() props=', this.props);
        const {artists, selectedArtist, selectedAlbum, playlist, songUrl} = this.props;

        return (
            <div className="container-fluid">
                <Navbar />
                <div className="row">
                    <div className="col-md-4">
                        <ArtistView artist={ artists[selectedArtist.index] || {} }
                                    selectedArtist={ selectedArtist }
                        />
                    </div>
                    <div className="col-md-4">
                        <AlbumView album={selectedAlbum}
                                   addToPlaylist={ this.addEntryToPlaylist }
                       />
                    </div>
                    <div className="col-md-4">
                        <Player
                            url={songUrl}
                            nextSong={this.nextSong}
                        />
                        <PlaylistView
                                    playlist={playlist}
                                    artists={artists}
                                    removeEntry={this.removeEntryFromPlaylist}
                        />
                    </div>
                </div>
                <ArtistList artists={artists}
                            selectedArtist={selectedArtist}
                />
            </div>
        );
    }

    addEntryToPlaylist(index) {
        console.log('addEntryToPlaylist', index);

        const {artists, selectedArtist, selectedAlbum, dispatch} = this.props;
        if(selectedArtist.index >= 0 && selectedAlbum.index >= 0) {
            const artist = artists[selectedArtist.index];
            if(artist) {
                const album = artist.albums[selectedAlbum.index];
                if (album && album.songs) {
                    const indexes = Array.isArray(index) ? index : [index];
                    const validIndexs = indexes.filter(i => album.songs[i]);
                    dispatch(addToPlaylist(selectedArtist.index, selectedAlbum.index, validIndexs));
                }
            }
        }
    }

    removeEntryFromPlaylist(index) {
        console.log('removeEntryFromPlaylist', index);
        const {dispatch} = this.props;
        dispatch(removeFromPlaylist(index));
    }
}

const mapStateToProps = state => {
    const { albums, selectedArtist, selectedAlbum, playlist } = state;
    const props =  {
        artists: albums.artists,
        selectedArtist,
        selectedAlbum,
        playlist,
        songUrl: getSongUrl(state, playlist[0] || {})
    };

    console.log('mapStateToProps:', state, '=>', props);
    return props;
};

export default connect(mapStateToProps)(Main);
