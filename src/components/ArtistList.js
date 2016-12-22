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
    const catgegories = {};
    artists.forEach((a, i) => {
        const catgeory = getCategory(a.artist);
        catgegories[catgeory] = catgegories[catgeory] || [];
        catgegories[catgeory].push({artist: a, index: i});
    });
    return catgegories;
}

function getActiveIndex(name) {
    if(name) {
        const category = getCategory(name);
        const index = _.findIndex(CATEGORIES, (c) => c === category);
        if(index >= 0) {
            return index;
        }
    }
    return 0;
}


export default class ArtistList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: getActiveIndex(props.currentArtist && props.currentArtist.name)
        };

        this.onTabChange = this.onTabChange.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.currentArtist !== this.props.currentArtist) {
            this.state = {
                activeIndex: getActiveIndex(nextProps.currentArtist && nextProps.currentArtist.name)
            };

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

    renderPanels(categories, partCategories) {
        const panels = [];
        partCategories.forEach(c => {
            const category = categories[c];
            if(category) {
                panels.push(<Tab title={c} key={c} ><Box>{this.renderArtistNames(category)}</Box></Tab>);
            }
        });

        return panels;
    }

    render() {
        const categories = categorize(this.props.artists);
        console.log('ArtistList.render:', categories);
        return (
            <div>
                <Heading>All artists:</Heading>
                <Tabs justify='start' activeIndex={this.state.activeIndex} onActive={this.onTabChange}>
                    {this.renderPanels(categories, CATEGORIES)}
                </Tabs>
            </div>
        );
    }

    onTabChange(index) {
        console.log('onTabChange', index);
        this.setState({
            activeIndex: index
        });
    }

    onClick(event) {
        const target = event.target;
        const artistId = target.id;
        const artistIndex = artistId.substring(3);
        console.log('ClickHandler', artistIndex);
        this.props.setArtist(artistIndex);
    }
}

ArtistList.propTypes = {
    artists: PropTypes.arrayOf(PropTypes.object),
    currentArtist: PropTypes.object,
    setArtist: React.PropTypes.func
};
