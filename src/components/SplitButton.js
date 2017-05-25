import React, { Component } from 'react';
import PropTypes from 'prop-types';


function btnClassNames(size) {
    let classNames = 'btn btn-default';
    switch(size) {
        case 'extra-small': classNames += ' btn-xs'; break;
        case 'small': classNames += ' btn-sm'; break;
        case 'large': classNames += ' btn-lg'; break;
    }
    return classNames;
}


class SplitButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        };

        this.toggleState = this.toggleState.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }


    toggleState() {
        this.setState({open: !this.state.open});
    }

    onClick(e) {
        const name = e.currentTarget.name;

        if(this.state.open) {
            this.setState({open: false});
        }

        if(name) {
            const {defaultOnClick, defaultLabel, actions} = this.props;
            if(name === 'default' && defaultOnClick){
                defaultOnClick('default', defaultLabel);
            } else {
                const action = actions[name];
                if(action && action.onClick) {
                    action.onClick(name, action.label);
                }
            }
        }
    }

    onBlur() {
        setTimeout(() => { // if(nothing is clicked in dropdown after 200ms, the SplitButtin has lost focus, -> close()
            if(this.state.open) {
                this.setState({open: false});
            }
        }, 200);
    }

    render() {

        const { defaultLabel, defaultIcon, actions, size } = this.props;
        const divClassName = 'btn-group' + (this.state.open ? ' open' : '');

        function getDefaulLabel() {
            if(defaultIcon && defaultLabel) {
                return (<span>{defaultIcon} &nbsp; {defaultLabel}</span>);
            } else {
                return (<span>{defaultIcon}{defaultLabel}</span>);
            }
        }

        return(
            <div className={divClassName}>
                <button type="button" className={btnClassNames(size)} onClick={this.onClick} name="default">
                    { getDefaulLabel() }
                </button>
                <button type="button" className={btnClassNames(size) + ' dropdown-toggle'} onClick={this.toggleState}
                        onBlur={this.onBlur}>
                    <span className="caret"/>
                </button>
                <ul className="dropdown-menu">
                    {
                        actions && actions.map((a, i) => (
                            <li key={i}><a href="#" onClick={this.onClick} name={i}>{a.label}</a></li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}


SplitButton.propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired
    })).isRequired,
    defaultLabel: PropTypes.string.isRequired,
    defaultOnClick: PropTypes.func,
    defaultIcon: PropTypes.element,
    size: PropTypes.oneOf(['extra-small','small', 'medium', 'large']).isRequired
};

SplitButton.defaultProps = {
    size: 'medium'
};

export default SplitButton;
