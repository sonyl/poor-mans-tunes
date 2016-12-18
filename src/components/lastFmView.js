import React from 'react';


export default class LastFmView extends React.Component {

    render() {

        return (
            <div>
                {this.props.wiki && this.props.wiki.summary}
            </div>
        );
    }
}