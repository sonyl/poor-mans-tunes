import React, {Component} from 'react';
import { connect } from 'react-redux';
import findIndex from 'lodash/findIndex';

import { fetchAllAlbums } from '../actions/albumsActions';
import { selectNewArtist, unselectArtist } from '../actions/artistActions';
import { selectNewAlbum, unselectAlbum } from '../actions/albumActions';

import PlaylistView from './PlaylistView';
import Navbar from '../components/Navbar';
import ArtistList from './ArtistList';
import ArtistView from './ArtistView';
import AlbumView from './AlbumView';
import Player from './Player';

function getArtistIndex(artists, artist) {
    return findIndex(artists, {artist});
}

function getAlbumIndex(albums, album) {
    return findIndex(albums, {album});
}


class Main extends Component {

    componentDidMount() {
        this.props.fetchAllAlbums();
    }

    /* new route selected */
    componentWillReceiveProps(nextProps) {
        const {params, artists, selectedArtist, selectedAlbum} = nextProps;
        console.log('Main.componentWillReceiveProps() nextProps:', nextProps, params, artists, params.artist);

        if(params.artist !== selectedArtist.name) {
            if(params.artist) {
                const index = getArtistIndex(artists, params.artist);
                if (index >= 0) {
                    this.props.selectNewArtist(index, artists[index].artist);
                }
            } else {
                this.props.unselectArtist();
            }

        }
        if(params.album !== selectedAlbum.name ) {
            if(params.album) {
                if(selectedArtist.index) {
                    const artist = artists[selectedArtist.index];
                    const index = getAlbumIndex(artist.albums, params.album);
                    if (index >= 0) {
                        this.props.selectNewAlbum(index, artist.albums[index]);
                    }
                }
            } else {
                this.props.unselectAlbum();
            }
        }
    }

    render() {
        console.log('Main.render() props=', this.props);

        return (
            <div className="container-fluid">
                <Navbar />
                <div className="row">
                    <div className="col-md-4">
                        <ArtistView />
                    </div>
                    <div className="col-md-4">
                        <AlbumView  />
                    </div>
                    <div className="col-md-4">
                        <Player />
                        <PlaylistView />
                    </div>
                </div>
                <ArtistList />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const { albums, selectedArtist, selectedAlbum, playlist } = state;
    const props =  {
        artists: albums.artists,
        selectedArtist,
        selectedAlbum,
        playlist
    };

    return props;
};

const mapDispatchToProps = () => {
    return {
        fetchAllAlbums,
        selectNewArtist,
        unselectArtist,
        selectNewAlbum,
        unselectAlbum
    };
};

export default connect(mapStateToProps, mapDispatchToProps())(Main);
