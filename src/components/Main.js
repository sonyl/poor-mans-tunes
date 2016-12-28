import React from 'react';
import update from 'immutability-helper';
import {getAlbumIndex, getLastFmAlbumInfo, getLastFmArtistInfo, createMp3Url} from '../clients';

import App from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';

import ArtistList from 'components/ArtistList';
import SongView from 'components/SongView';
import ArtistView from 'components/ArtistView';
import LastFmView from 'components/LastFmView';
import AlbumView from 'components/AlbumView';
import Player from 'components/Player';
import ArtistSearch from 'components/ArtistSearch';


export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            artists: [],
            currentArtist: {},
            currentAlbum: {},
            currentSong: {}
        };

        this.setCurrentArtist = this.setCurrentArtist.bind(this);
        this.setCurrentAlbum = this.setCurrentAlbum.bind(this);
        this.setCurrentSong = this.setCurrentSong.bind(this);
    }

    componentDidMount() {
        getAlbumIndex().then(artists => {
            if(artists) {
                console.log('Albums read: ', artists.length);
                this.setState({artists: artists});
            } else {
                console.log('Albums read: transport error');
            }
        });
    }

    componentDidUpdate(prevProps, prevState){
        const state = this.state;
        console.log('componentDidUpdate new state: ', this.state);

        if(state.currentArtist.name && state.currentArtist.name !== prevState.currentArtist.name) {
            this.updateLastFmArtistInfo();
        }

        if(state.currentArtist.name && state.currentAlbum.name &&
            (state.currentArtist.name !== prevState.currentArtist.name ||
             state.currentAlbum.name !== prevState.currentAlbum.name)
        ) {
            this.updateLastFmAlbumInfo();
        }
    }

    updateLastFmAlbumInfo() {
        const {currentArtist, currentAlbum} = this.state;

        if (currentArtist.name && currentAlbum.name) {
            getLastFmAlbumInfo(currentArtist.name, currentAlbum.name)
                .then(album => {
                    console.log('The lastFM album info is:', album);
                    album = album || {
                        artist: currentArtist.name,
                        name: currentAlbum.name,
                        wiki: {
                            summary: 'no Info available'
                        }
                    };
                    const newCurAlbum = update(currentAlbum, {lastFm: {$set: album}});
                    this.setState({currentAlbum: newCurAlbum});
                });
        }
    }

    updateLastFmArtistInfo() {
        const {currentArtist} = this.state;
        if (currentArtist.name) {
            getLastFmArtistInfo(currentArtist.name)
            .then(artist => {
                console.log('The lastFM artist info is:', artist);
                artist = artist || {
                };
                const newCurArtist = update(currentArtist, {lastFm: {$set: artist}});
                console.log('The new currentArtist will be set:', newCurArtist);
                this.setState({currentArtist: newCurArtist});
            });
        }
    }


    render() {
        const { artists, currentSong, currentArtist, currentAlbum } = this.state;
        return (
            <App centered={false}>
                <Header direction="row" justify="between" pad={{horizontal: 'medium'}}>
                    <Title>Poor Man&rsquo;s Tunes</Title>
                    <ArtistSearch artists={artists} setArtist={this.setCurrentArtist}/>
                </Header>
                <Columns>
                        <ArtistView artist={ artists[currentArtist.index] || {} }
                                    currentArtist={ currentArtist }
                                    currentAlbum={ currentAlbum }
                                    setAlbum={ this.setCurrentAlbum }
                        />
                        <LastFmView artist={currentArtist}
                                    album={currentAlbum.lastFm}
                        />
                    <Box>
                        <AlbumView
                                   album={ currentAlbum }
                                   currentSong={ currentSong }
                                   setSong={ this.setCurrentSong }
                        />
                        <Player url={createMp3Url(currentSong && currentSong.song && currentSong.song.mp3)}/>
                    </Box>
                </Columns>
                <ArtistList artists={artists}
                            currentArtist={currentArtist}
                            setArtist={this.setCurrentArtist}
                />

            </App>
        );
    }

    setCurrentArtist(index) {
        const state = this.state;
        console.log('setCurrentArtist', index);

        if(state.artists[index] && state.currentArtist.index !== index) {
            this.setState({
                currentArtist: {index, name: this.state.artists[index].artist},
                currentAlbum: {}
            });
        }
    }

    setCurrentAlbum(index) {
        const state = this.state;
        console.log('setCurrentAlbum', index);

        if(state.currentArtist.index >= 0) {
            const artist = state.artists[state.currentArtist.index];

            if(artist.albums[index]) {
                this.setState({
                    currentAlbum: {
                        index,
                        name: artist.albums[index].album,
                        album: artist.albums[index]
                    }
                });
            }
        }
    }

    setCurrentSong(index) {
        const state = this.state;
        console.log('setCurrentSong', index);

        if(state.currentArtist.index >= 0 && state.currentAlbum.index >= 0) {
            const artist = state.artists[state.currentArtist.index];
            if(artist) {
                const album = artist.albums[state.currentAlbum.index];

                if (album && album.songs && album.songs[index]) {
                    this.setState({
                        currentSong: {
                            index,
                            name: album.songs[index].title,
                            song: album.songs[index]
                        }
                    });
                }
            }
        }
    }
}