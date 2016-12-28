import React, {Component, PropTypes} from 'react';
import Search from 'grommet/components/Search';
import _ from 'lodash';


function reorganize(artists) {
    'use strict';

    return artists ? artists.map((a, i) => ({label: a.artist, index: i})) : [];
}

export default class ArtistSearch extends Component {
    static propTypes = {
        artists: PropTypes.arrayOf(
            PropTypes.shape({
                    artist: PropTypes.string.isRequired
            }).isRequired
        ).isRequired,
        setArtist: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);


        this.state = {
            artists: reorganize(props.artists),
            value: ''
        };

        this.getSuggestions = this.getSuggestions.bind(this);
        this.handleDOMChange = this.handleDOMChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({artists: reorganize(nextProps.artists)});

    }

    getSuggestions() {
        const {value, artists} = this.state;
        if( !value ) {
            return [];
        }

        const regExp = new RegExp(value, 'i');
        return _.take(_.filter(artists, (a) => {
            return regExp.test(a.label);
        }), 20);
    }


    handleDOMChange(event) {
        const { value } = event.target;

        if(value !== this.state.value) {
            this.setState({value: value});
        }
    }

    handleSelect(target, selected) {
        const { setArtist } = this.props;
        const { suggestion } = target;

        if(suggestion) {
            this.setState({value: suggestion.label});
            if(setArtist) {
                setArtist(suggestion.index);
            }
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
