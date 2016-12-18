import React from 'react';
import update from 'immutability-helper';

import ArtistList from 'components/artistList';
import SongView from 'components/songView';
import ArtistView from 'components/artistView';
import LastFmView from 'components/lastFmView';

import {lastFmApi} from '../credentials';

function getAlbumIndex() {

    const url = 'public/files.json';

    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log('parsed json', json);
            return json;
        }).catch(e => {
            console.log('parsing failed', e)
        });
}


function getLastFMInfo(artist, album) {
    const params = {
        method:  "album.getinfo",
        api_key: lastFmApi,
        artist:  artist,
        album:   album,
        autocorrect: "1",
        format:  "json"
    };

    const esc = encodeURIComponent;
    const query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    const url = "http://ws.audioscrobbler.com/2.0/?" + query;
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log("Response-json", json);
            return json.album;
        }).catch(e => {
            console.log('parsing failed', e);
        })
}

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            artists: [],
            currentArtist: {},
            currentAlbum: {},
            currentSong: {}
        };
    }

    componentDidMount() {
        getAlbumIndex().then(artists => {
            if(artists) {
                console.log("Albums read: ", artists.length);
                this.setState({artists: artists});
            } else {
                console.log("Albums read: transport error");
            }
        });
    }

    componentDidUpdate(prevProps, prevState){
        const state = this.state;

        if(state.currentArtist.name && state.currentAlbum.name &&
            (state.currentArtist.name !== prevState.currentArtist.name ||
             state.currentAlbum.name !== prevState.currentAlbum.name)
        ) {
            this.updateLastFmInfo();
        }
    }

    updateLastFmInfo() {
        const state = this.state;
        console.log("updateLastFmInfo:", state);

        if (state.currentArtist.name && state.currentAlbum.name) {
            getLastFMInfo(state.currentArtist.name, state.currentAlbum.name)
                .then(album => {
                    console.log("The lastFM info is:", album);
                    const wiki = (album && album.wiki) ? album.wiki : {summary: "no Info available"};
                    const currentAlbum = update(state.currentAlbum, {wiki: {$set: wiki}});
                    this.setState({currentAlbum});
                });
        }
    }

    render() {
        const state = this.state;
        return (
            <div>
                <SongView artist={state.currentArtist}
                          album={state.currentAlbum}
                          song={state.currentSong}
                />
                <LastFmView wiki={this.state.currentAlbum.wiki}/>
                <ArtistView artist={state.currentArtist.index >= 0 ? state.artists[state.currentArtist.index] : {}}
                            currentAlbum={ state.currentAlbum }
                            setAlbum={this.setCurrentAlbum.bind(this)}
                />
                <ArtistList artists={this.state.artists}
                            setArtist={this.setCurrentArtist.bind(this)}
                            setSong={this.setCurrentSong.bind(this)}
                />
            </div>
        )
    }

    setCurrentArtist(index) {
        console.log("setCurrentArtist", index);
        if(index>= 0 && index < this.state.artists.length) {
            this.setState({
                currentArtist: {index, name: this.state.artists[index].artist},
                currentAlbum: {}
            });
        }
    }

    setCurrentAlbum(index) {
        const state = this.state;
        console.log("setCurrentAlbum", index);
        if(state.currentArtist.index >= 0) {

            const artist = state.artists[state.currentArtist.index];

            if(artist.albums[index]) {
                this.setState({
                    currentAlbum: {index, name: artist.albums[index].album}
                });
            }
        }
    }

    setCurrentSong(index) {

    }
}