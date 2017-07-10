/* @flow */

import React from 'react';

type Props = { id: string, maxValue?: number, value: number, text: string };

function ProgressBar({id, maxValue=100, value, text}: Props) {
    const percent = value * 100 / maxValue;
    const style = {width: `${percent}%`};

    return (
        <div id={id} className="progress" style={{'marginBottom': '0px'}}>
            <div className="progress-bar"
                role="progressbar"
                style={style}
            >
                {text}
            </div>
        </div>
    );
}

export default ProgressBar;