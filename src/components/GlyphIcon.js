/* @flow */

import React from 'react';

type GlyphIconProps = { iconName: string, props?: mixed[]};


const GlyphIcon = ({iconName, ...props}: GlyphIconProps) => (
    <span className={`glyphicon glyphicon-${iconName}`} {...props}/>
);


export default GlyphIcon;
