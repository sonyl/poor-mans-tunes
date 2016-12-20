import React from 'react';

import Card from 'grommet/components/Card';
import Markdown from 'grommet/components/Markdown';


function getThumbnail(album) {
    if(album && album.image) {
        if (album.image.length > 3 && album.image[3]['#text'].length > 0) {
            return album.image[3]['#text'];
        }
        if (album.image.length > 2 && album.image[2]['#text'].length > 0) {
            return album.image[2]['#text'];
        }
        if (album.image.length > 1 && album.image[1]['#text'].length > 0) {
            return album.image[1]['#text'];
        }
        if (album.image.length > 0 && album.image[0]['#text'].length > 0) {
            return album.image[0]['#text'];
        }
    }
}

export default class LastFmView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        console.log("LastFmView:", this.props);
        const album = this.props.album;
        const albumName = album && album.name || '';
        const artistName = album && album.artist || '';
        const heading = artistName || albumName ? artistName + ' - ' + albumName : '';

        return (
            <Card
                label='LastFM Info:'
                heading={ heading }
                thumbnail={getThumbnail(album)}
            >
                <Markdown content={this.props.album && this.props.album.wiki && this.props.album.wiki.summary}/>
            </Card>
        );
    }
}