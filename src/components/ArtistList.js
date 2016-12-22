import React, {PropTypes} from 'react';
import _ from 'lodash';

import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';

const CATEGORIES = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Y','Z', '0..9'];
const IGNORE = ['The ', 'the ', 'Die ', 'die '];
const MAP = {'Ä': 'A', 'Ö': 'O', 'Ü': 'U'};


function getCategory(name) {
    for(let i=0; i < IGNORE.length; i++) {
        if(name.startsWith(IGNORE[i])) {
            name = name.substr(IGNORE[i].length);
            break;
        }
    }
    let catgeory = name.substr(0, 1).toUpperCase();
    catgeory = MAP[catgeory] || catgeory;
    if(CATEGORIES.indexOf(catgeory) < 0) {
        catgeory = '0..9';
    }
    return catgeory;
}

function categorize(artists) {
    const catgegoryMap = {};
    artists.forEach((a, i) => {
        const catgeory = getCategory(a.artist);
        catgegoryMap[catgeory] = catgegoryMap[catgeory] || [];
        catgegoryMap[catgeory].push({artist: a, index: i});
    });
    const categories = [];
    CATEGORIES.forEach(c => {
        const artists = catgegoryMap[c];
        if(artists) {
            categories.push({category: c, artists});
        }
    });

    return categories;
}

function getActiveIndex(categories, name) {
    if(!name) {
        return 0;
    }

    const category = getCategory(name);
    const index = _.findIndex(categories, c => c.category === category);
    return index > 0 ? index : 0;
}


export default class ArtistList extends React.Component {

    constructor(props) {
        super(props);
        const categories = categorize(props.artists);
        this.state = {
            categories,
            activeIndex: getActiveIndex(categories, props.currentArtist && props.currentArtist.name)
        };

        this.onTabChange = this.onTabChange.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.artists !== this.props.artists
            || nextProps.currentArtist !== this.props.currentArtist) {

            const categories = categorize(nextProps.artists);
            this.setState( {
                categories,
                activeIndex: getActiveIndex(categories, nextProps.currentArtist && nextProps.currentArtist.name)
            });
        }
    }

    renderArtistNames(category) {
        return category.map(c => {
            const artist = c.artist.artist;
            const selected = this.props.currentArtist.name === artist;
            const classNames = selected ? 'selected' : '';
            return (
                <div
                    id={`ar-${c.index}`}
                    className={classNames}
                    key={artist}
                    onClick={ this.onClick}
                >
                    {artist}
                </div>
            );
        });
    }

    renderPanels() {
        const {categories} = this.state;

        return categories.map(c => {
            return <Tab title={c.category} key={c.category} ><Box>{this.renderArtistNames(c.artists)}</Box></Tab>;
        });
    }

    render() {
        const {activeIndex} = this.state;
        return (
            <div>
                <Heading>All artists:</Heading>
                <Tabs justify='start' activeIndex={activeIndex} onActive={this.onTabChange}>
                    {this.renderPanels()}
                </Tabs>
            </div>
        );
    }

    onTabChange(index) {
        this.setState({
            activeIndex: index
        });
    }

    onClick(event) {
        const target = event.target;
        const artistId = target.id;
        const artistIndex = artistId.substring(3);
        this.props.setArtist(artistIndex);
    }
}

ArtistList.propTypes = {
    artists: PropTypes.arrayOf(PropTypes.object),
    currentArtist: PropTypes.object,
    setArtist: React.PropTypes.func
};
