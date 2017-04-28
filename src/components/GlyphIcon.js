import React from 'react';
import PropTypes from 'prop-types';


function GlyphIcon({iconName, ...props}) {
    return <span className={`glyphicon glyphicon-${iconName}`} {...props}/>;
}

GlyphIcon.propTypes = {
    iconName: PropTypes.string.isRequired
};

export default GlyphIcon;
