import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import Search from 'grommet/components/Search';


function reorganize(artists = []) {
    const db = artists.map(a => ({label: a.artist, artist: a.artist}));
    artists.forEach(a => {
        const albums = a.albums || [];
        albums.forEach(al => {
            db.push({label: `${a.artist} : ${al.album}`, artist: a.artist, album: al.album});
        });
    });
    return db;
}

export default class ArtistSearch extends Component {
    static propTypes = {
        artists: PropTypes.arrayOf(
            PropTypes.shape({
                artist: PropTypes.string.isRequired
            }).isRequired
        ).isRequired
    };

    constructor(props) {
        super(props);


        this.state = {
            db: reorganize(props.artists),
            value: ''
        };

        this.getSuggestions = this.getSuggestions.bind(this);
        this.handleDOMChange = this.handleDOMChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({db: reorganize(nextProps.artists)});
    }

    getSuggestions() {
        const {value, db} = this.state;
        if( !value ) {
            return [];
        }

        const regExp = new RegExp(value, 'i');
        const suggestions = [], MAX=20;
        for(let i = 0; i < db.length && suggestions.length < MAX; i++) {
            const entry = db[i];
            if(entry.album) {
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
    }


    handleDOMChange(event) {
        const { value } = event.target;

        if(value !== this.state.value) {
            this.setState({value: value});
        }
    }

    handleSelect(target) {
        const { suggestion } = target;

        if(suggestion) {
            this.setState({value: suggestion.label});
            let path = `/${suggestion.artist}`;
            if(suggestion.album) {
                path += `/${suggestion.album}`
            }
            browserHistory.push(path);
        }
    }

    render() {
        console.log('ArtistSearch.render:', this.props);
        return (
            <Search
//                dropAlign={{right: 'right', bottom: 'top'}}
                placeHolder='Serach for artist'
                inline={ true }
                suggestions={this.getSuggestions()}
                onDOMChange={this.handleDOMChange}
                onSelect={this.handleSelect}
                value={this.state.value}
            />
        );
    }
}
