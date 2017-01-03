import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchAllAlbums } from '../actions/albumsActions';
import { selectNewArtist } from '../actions/artistActions';
import { selectNewAlbum } from '../actions/albumActions';
import { addToPlaylist, removeFromPlaylist } from '../actions/playlistActions';
import { getSongUrl } from '../reducers';
import _ from 'lodash';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';

import ArtistList from 'components/ArtistList';
import ArtistView from 'components/ArtistView';
import AlbumView from 'components/AlbumView';
import PlaylistView from 'components/PlaylistView';
import Player from 'components/Player';
import ArtistSearch from 'components/ArtistSearch';


function getArtistIndex(artists, artist) {
    return _.findIndex(artists, {artist});
}

function getAlbumIndex(albums, album) {
    return _.findIndex(albums, {album});
}


class Main extends Component {

    constructor(props) {
        super(props);

        this.addEntryToPlaylist = this.addEntryToPlaylist.bind(this);
        this.fastForward = this.removeEntryFromPlaylist.bind(this, 0);
        this.removeEntryFromPlaylist = this.removeEntryFromPlaylist.bind(this);
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(fetchAllAlbums());
    }

    componentWillReceiveProps(nextProps) {
        const {params, artists, selectedArtist, selectedAlbum, dispatch} = nextProps;
        console.log('Main.componentWillReceiveProps() nextProps:', nextProps, params, artists, params.artist);
        if(params.artist && params.artist != selectedArtist.name ) {
            const index = getArtistIndex(artists, params.artist);
            if(index >= 0) {
                dispatch(selectNewArtist(index, artists[index].artist));
            }
        }
        if(selectedArtist.index && params.album && params.album != selectedAlbum.name ) {
            const artist = artists[selectedArtist.index];
            const index = getAlbumIndex(artist.albums, params.album);
            if(index >= 0) {
                dispatch(selectNewAlbum(index, artist.albums[index]));
            }
        }
    }


    render() {
        console.log('Main.render() props=', this.props);
        const {artists, selectedArtist, selectedAlbum, playlist, songUrl} = this.props;

        return (
            <App centered={false}>
                <Header direction="row" justify="between" pad={{horizontal: 'medium'}}>
                    <Title>Poor Man&rsquo;s Tunes</Title>
                    <ArtistSearch artists={artists} />
                </Header>
                <Columns>
                    <ArtistView artist={ artists[selectedArtist.index] || {} }
                                selectedArtist={ selectedArtist }
                    />
                    <AlbumView artist={selectedArtist}
                                album={selectedAlbum}
                                addToPlaylist={ this.addEntryToPlaylist }
                    />
                    <Box>
                        <Player
                            url={songUrl}
                            fastForward={this.fastForward}
                        />
                        <PlaylistView playlist={playlist} artists={artists} removeEntry={this.removeEntryFromPlaylist}/>
                    </Box>
                </Columns>
                <ArtistList artists={artists}
                            selectedArtist={selectedArtist}
                            selectArtist={this.selectArtist}
                />

            </App>
        );
    }

    addEntryToPlaylist(index) {
        console.log('addEntryToPlaylist', index);

        const {artists, selectedArtist, selectedAlbum, dispatch} = this.props;
        if(selectedArtist.index >= 0 && selectedAlbum.index >= 0) {
            const artist = artists[selectedArtist.index];
            if(artist) {
                const album = artist.albums[selectedAlbum.index];

                if (album && album.songs && album.songs[index]) {
                    dispatch(addToPlaylist(selectedArtist.index, selectedAlbum.index, index));
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
