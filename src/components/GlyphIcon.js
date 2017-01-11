import React, { PropTypes }  from 'react';


function GlyphIcon({iconName, ...props}) {
    return <span className={`glyphicon glyphicon-${iconName}`} {...props}/>;
}

GlyphIcon.propTypes = {
    iconName: PropTypes.string.isRequired
};

export default GlyphIcon;
