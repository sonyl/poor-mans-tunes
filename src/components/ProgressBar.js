import React, { PropTypes }  from 'react';


function ProgressBar({id, maxValue=100, value, text}) {
    const percent = value * 100 / maxValue;
    const style = {width: `${percent}%`};

    return (
        <div id={id} className="progress" style={{'margin-bottom': '0px'}}>
            <div className="progress-bar"
                 role="progressbar"
                 style={style}
            >
                {text}
            </div>
        </div>
    );
}

ProgressBar.propTypes = {
    id: PropTypes.string,
    text: PropTypes.string,
    maxValue: PropTypes.number,
    value: PropTypes.number.isRequired
};

export default ProgressBar;