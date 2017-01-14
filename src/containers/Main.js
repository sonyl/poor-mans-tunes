import React, {Component} from 'react';
import { connect } from 'react-redux';
import findIndex from 'lodash/findIndex';

import { fetchAllAlbums } from '../actions/albumsActions';
import { selectArtist, unselectArtist, selectAlbum, unselectAlbum, setPlayRandom } from '../actions/selectionActions';

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
                    this.props.selectArtist(index, artists[index].artist);
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
                        this.props.selectAlbum(index, artist.albums[index]);
                    }
                }
            } else {
                this.props.unselectAlbum();
            }
        }
    }

    setRandom(newState) {
        console.log('setRandom clicked', newState);
        this.props.setPlayRandom(!!newState);
    }

    render() {
        console.log('Main.render() props=', this.props);

        return (
            <div className="container-fluid">
                <Navbar randomActive={this.props.set.playRandom} setRandom={this.setRandom.bind(this)}/>
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
    const { albums, selection, playlist } = state;
    const props =  {
        artists: albums.artists,
        selectedArtist: selection.artist,
        selectedAlbum: selection.album,
        set: selection.set,
        playlist
    };

    return props;
};

const mapDispatchToProps = () => {
    return {
        fetchAllAlbums,
        selectArtist,
        unselectArtist,
        selectAlbum,
        unselectAlbum,
        setPlayRandom
    };
};

export default connect(mapStateToProps, mapDispatchToProps())(Main);
