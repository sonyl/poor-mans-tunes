/* @flow */
import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import { createLinkUrl, createLog } from '../utils';
import { addSongsToPlaylist } from '../actions/playlistActions';
import { getArtists } from '../reducers';
import GlyphIcon from '../components/GlyphIcon';

import type { Collection, PlaylistSong, Url } from '../types';

type DbEntry = {label: string, artist: string, album?: string, song?: string, url?: Url };
type SearchDb = DbEntry[];


const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'ArtistSearch');


const theme = {
    input: {
        width: '350px'
    },
    containerOpen: {

    },
    suggestionsContainer:{
        display: 'block',
        position: 'absolute',
        border: '1px solid #aaa',
        backgroundColor: '#fff',
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        zIndex: 2000
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none'
    },
    suggestion: {
        cursor: 'pointer',
        padding: '5px 10px'
    },
    suggestionHighlighted: {
        backgroundColor: '#ddd'
    }
};


function reorganize(artists: Collection = []): SearchDb {
    const db: SearchDb = artists.map(a => ({label: a.artist, artist: a.artist}));
    artists.forEach(a => {
        const albums = a.albums || [];
        albums.forEach(al => {
            db.push({label: `${a.artist} : ${al.album}`, artist: a.artist, album: al.album});
        });
    });
    artists.forEach(a => {
        const albums = a.albums || [];
        albums.forEach(al => {
            const songs = al.songs;
            songs.forEach(song => {
                db.push({label: `${a.artist} : ${al.album} : ${song.title}`,
                    artist: a.artist, album: al.album, song: song.title, url: song.src});
            });
        });
    });
    return db;
}

// When suggestion is clicked, Autosuggest needs to populate the input element
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.label;

const renderSuggestion = suggestion => (
    <div>
        {suggestion.label}
    </div>
);

const renderInputComponent = inputProps => (
    <div className="inputContainer" >
        <GlyphIcon iconName="search"/>
        <input {...inputProps} />
    </div>
);

type Props = {
    artists: Collection,
    history: History,
    addSongsToPlaylist: (artist: string, album: string, songs: PlaylistSong[] | PlaylistSong, top: boolean)=> void
}
type DefaulProps = void
type State = {
    searchDb: SearchDb,
    suggestions: Array<{label: string}>,
    value: string
}

class ArtistSearch extends Component<DefaulProps, Props, State> {

    state: State;

    constructor(props: Props) {
        super(props);

        this.state = {
            searchDb: reorganize(props.artists),
            suggestions: [],
            value: ''
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        log('componentWillReceiveProps', 'nextProps:', nextProps);
        this.setState({searchDb: reorganize(nextProps.artists)});
    }

    getSuggestions = value => {
        const { searchDb } = this.state;
        if( !value ) {
            return [];
        }

        const regExp = new RegExp(value, 'i');
        const suggestions = [], MAX=10;
        for(let i = 0; i < searchDb.length && suggestions.length < MAX; i++) {
            const entry = searchDb[i];
            if(entry.song) {
                if(regExp.test(entry.song)) {
                    suggestions.push(entry);
                }
            } else if(entry.album) {
                if(regExp.test(entry.album)) {
                    suggestions.push(entry);
                }
            } else {
                if(regExp.test(entry.artist)) {
                    suggestions.push(entry);
                }
            }
        }
        return suggestions;
    };

    onChange = (event, { newValue, method }) => {
        log('onChange:', 'newValue=%o, method=%o', newValue, method);
        this.setState({
            value: newValue
        });
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = (event, {suggestion, ...opts}) => {
        log('onSuggestionSelected', 'suggestion=%o, opts=%o', suggestion, opts);
        if(suggestion) {
            const {artist, album, song, url} = suggestion;
            this.props.history.push(createLinkUrl(artist, album));
            if(artist && album && song && url) {
                this.props.addSongsToPlaylist(artist, album, {song, url}, true);
            }
            this.setState({value: ''});
        }
    };

    render() {
        const { value, suggestions } = this.state;

        log('render', 'props=', this.props);

        // Autosuggest will pass through all these props to the input element.
        const inputProps = {
            placeholder: 'Type an artist or album name or song title',
            value,
            onChange: this.onChange
        };

        return (
            <Autosuggest
                theme={theme}
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                renderInputComponent={renderInputComponent}
                inputProps={inputProps}
            />
        );
    }
}
const mapStateToProps = state => ({
    artists: getArtists(state)
});


export default withRouter(connect(mapStateToProps, { addSongsToPlaylist })(ArtistSearch));