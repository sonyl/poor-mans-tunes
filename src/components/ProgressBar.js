/* @flow */

import React from 'react';

type Props = { id: string, maxValue?: number, value: number, text: string };

const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);


function ProgressBar({id, maxValue=100, value, text}: Props) {
    if(isNumeric(value)) {
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
    return null;
}

export default ProgressBar;